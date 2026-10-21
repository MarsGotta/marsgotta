import {
  CAMERA_TILT_DEG,
  formatHoursMinutes,
  JEZERO,
  MARS_ROTATION_HOURS,
  marsClock,
  SUN_AZIMUTH_DEG,
} from '../mars-clock';
import { projectSurfacePoint, simulatedLocalTime } from './geometry';
import { BAKE_FRAGMENT_SHADER, RENDER_FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

const DEG = Math.PI / 180;
/** ×3600 time-lapse: Mars turns once every 24.6229 s on screen. */
const ROTATION_DEG_PER_SECOND = 360 / MARS_ROTATION_HOURS;
/** Canvases narrower than this count as mobile: smaller texture and a lower pixel ratio. */
const SMALL_CANVAS = 420;
/** Radius of the sphere inside the canvas, which leaves room for the atmosphere halo. */
const SPHERE_RADIUS = 0.86;
/** Marker fade near the limb: fully visible once 0.22 of the radius towards the camera. */
const MARKER_FADE_DEPTH = 0.22;

export interface PlanetOptions {
  canvas: HTMLCanvasElement;
  marker: HTMLElement | null;
  markerTime: HTMLElement | null;
  /** Whether the planet may rotate: false while paused with SIM or with reduced motion. */
  shouldAnimate: () => boolean;
  /** Called once the first frame is on screen, to fade the CSS sphere out. */
  onReady: () => void;
}

type Uniform = 'uRes' | 'uTex' | 'uTexel' | 'uLon0' | 'uTilt' | 'uSunP' | 'uR' | 'uBump';

/** Procedural Mars in WebGL 1, lit by the real sun of the moment the page loads. */
export class MarsPlanet {
  private readonly gl: WebGLRenderingContext;
  private readonly options: PlanetOptions;
  private readonly program: WebGLProgram;
  private readonly texture: WebGLTexture;
  private readonly uniforms: Record<Uniform, WebGLUniformLocation | null>;
  private readonly startLongitude: number;
  private readonly equationOfTime: number;
  private readonly observers: { disconnect(): void }[] = [];
  private frame = 0;
  private alive = true;
  private visible = true;
  private ready = false;
  private simulatedSeconds = 0;
  private lastTimestamp = 0;
  private lastLabel = '';

  /** Returns null when WebGL is unavailable, so the CSS sphere stays as the fallback. */
  static create(options: PlanetOptions): MarsPlanet | null {
    const gl = options.canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return null;
    try {
      return new MarsPlanet(gl, options);
    } catch {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext, options: PlanetOptions) {
    this.gl = gl;
    this.options = options;
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const small = (options.canvas.clientWidth || 400) < SMALL_CANVAS;
    const maxSize = (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number | null) ?? 2048;
    const textureWidth = Math.min(small ? 1024 : 2048, maxSize);
    this.texture = this.bakeTexture(textureWidth, textureWidth / 2);

    this.program = this.link(RENDER_FRAGMENT_SHADER);
    gl.useProgram(this.program);
    const names: Uniform[] = ['uRes', 'uTex', 'uTexel', 'uLon0', 'uTilt', 'uSunP', 'uR', 'uBump'];
    this.uniforms = Object.fromEntries(
      names.map((name) => [name, gl.getUniformLocation(this.program, name)]),
    ) as Record<Uniform, WebGLUniformLocation | null>;

    gl.uniform1i(this.uniforms.uTex, 0);
    gl.uniform2f(this.uniforms.uTexel, 1 / textureWidth, 2 / textureWidth);
    gl.uniform1f(this.uniforms.uR, SPHERE_RADIUS);
    gl.uniform1f(this.uniforms.uBump, textureWidth > 1024 ? 2.6 : 1.8);
    gl.uniform1f(this.uniforms.uTilt, CAMERA_TILT_DEG * DEG);

    // The real sky at page load: today's subsolar latitude (the season) and longitude.
    const clock = marsClock(Date.now());
    const latitude = clock.subLat * DEG;
    const azimuth = SUN_AZIMUTH_DEG * DEG;
    gl.uniform3f(
      this.uniforms.uSunP,
      Math.cos(latitude) * Math.sin(azimuth),
      Math.sin(latitude),
      Math.cos(latitude) * Math.cos(azimuth),
    );
    this.startLongitude = clock.subLonE - SUN_AZIMUTH_DEG;
    this.equationOfTime = clock.eot;

    const intersection = new IntersectionObserver((entries) => {
      this.visible = entries.at(-1)?.isIntersecting ?? true;
      if (this.visible) this.kick();
    });
    intersection.observe(options.canvas);
    const resize = new ResizeObserver(() => this.kick());
    resize.observe(options.canvas);
    this.observers.push(intersection, resize);
    this.kick();
  }

  /** Draws again: the loop keeps running only while the planet may move and is on screen. */
  kick(): void {
    if (this.alive && !this.frame) this.frame = requestAnimationFrame((now) => this.tick(now));
  }

  dispose(): void {
    this.alive = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.observers.forEach((observer) => observer.disconnect());
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  private tick(now: number): void {
    this.frame = 0;
    if (!this.alive) return;
    const running = this.options.shouldAnimate() && this.visible;
    if (running) {
      // Cap the step so a background tab does not jump the planet forward.
      if (this.lastTimestamp)
        this.simulatedSeconds += Math.min(0.1, (now - this.lastTimestamp) / 1000);
      this.lastTimestamp = now;
    } else {
      this.lastTimestamp = 0;
    }
    this.draw();
    if (running) this.kick();
  }

  private draw(): void {
    const { gl, options } = this;
    const width = options.canvas.clientWidth;
    if (!width) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, width > SMALL_CANVAS ? 2 : 1.5);
    const size = Math.max(64, Math.round(width * pixelRatio));
    if (options.canvas.width !== size) {
      options.canvas.width = size;
      options.canvas.height = size;
    }

    const centralLongitude = this.startLongitude - ROTATION_DEG_PER_SECOND * this.simulatedSeconds;
    gl.viewport(0, 0, size, size);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uRes, size, size);
    gl.uniform1f(this.uniforms.uLon0, centralLongitude * DEG);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.placeMarker(centralLongitude);

    if (!this.ready) {
      this.ready = true;
      options.onReady();
    }
  }

  private placeMarker(centralLongitude: number): void {
    const { marker, markerTime } = this.options;
    const radius = (marker?.parentElement?.clientWidth ?? 0) / 2;
    if (!marker || !radius) return;
    const point = projectSurfacePoint(JEZERO.lat, JEZERO.lon - centralLongitude);
    const x = (radius + point.x * radius).toFixed(1);
    const y = (radius - point.y * radius).toFixed(1);
    marker.style.transform = `translate(${x}px, ${y}px) translateY(-50%)`;
    marker.style.opacity =
      point.depth > 0 ? Math.min(1, point.depth / MARKER_FADE_DEPTH).toFixed(2) : '0';

    const label = formatHoursMinutes(
      simulatedLocalTime(JEZERO.lon, centralLongitude, this.equationOfTime),
    );
    if (markerTime && label !== this.lastLabel) {
      this.lastLabel = label;
      markerTime.textContent = label;
    }
  }

  private bakeTexture(width: number, height: number): WebGLTexture {
    const { gl } = this;
    const texture = gl.createTexture();
    if (!texture) throw new Error('No texture');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const bake = this.link(BAKE_FRAGMENT_SHADER);
    gl.useProgram(bake);
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteProgram(bake);
    return texture;
  }

  private link(fragmentSource: string): WebGLProgram {
    const { gl } = this;
    const program = gl.createProgram();
    if (!program) throw new Error('No program');
    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'Link failed');
    }
    return program;
  }

  private compile(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('No shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? 'Compile failed');
    }
    return shader;
  }
}
