import {
  CAMERA_TILT_DEG,
  formatHoursMinutes,
  JEZERO,
  MARS_ROTATION_HOURS,
  marsClock,
  SUN_AZIMUTH_DEG,
} from '../mars-clock';
import { projectSurfacePoint, simulatedLocalTime } from './geometry';
import { isSoftwareRenderer, startProgram, whenLinked } from './gl';
import { BAKE_FRAGMENT_SHADER, RENDER_FRAGMENT_SHADER } from './shaders';

const DEG = Math.PI / 180;
/** ×3600 time-lapse: Mars turns once every 24.6229 s on screen. */
const ROTATION_DEG_PER_SECOND = 360 / MARS_ROTATION_HOURS;
/** Canvases narrower than this count as mobile: smaller texture and a lower pixel ratio. */
const SMALL_CANVAS = 420;
/** Radius of the sphere inside the canvas, which leaves room for the atmosphere halo. */
const SPHERE_RADIUS = 0.86;
/** Marker fade near the limb: fully visible once 0.22 of the radius towards the camera. */
const MARKER_FADE_DEPTH = 0.22;
/** The texture bakes in strips, one per frame, so the GPU never stalls the page for long. */
const BAKE_STRIP_ROWS = 64;

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
  private readonly renderProgram: WebGLProgram;
  private readonly bakeProgram: WebGLProgram;
  private readonly texture: WebGLTexture;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly textureWidth: number;
  private readonly uniforms: Record<Uniform, WebGLUniformLocation | null>;
  private readonly startLongitude: number;
  private readonly equationOfTime: number;
  private readonly observers: { disconnect(): void }[] = [];
  private bakedRows = 0;
  private frame = 0;
  private alive = true;
  private visible = true;
  private ready = false;
  private simulatedSeconds = 0;
  private lastTimestamp = 0;
  private lastLabel = '';

  /** Resolves to null without fast WebGL, so the CSS sphere stays as the fallback. */
  static async create(options: PlanetOptions): Promise<MarsPlanet | null> {
    const gl = options.canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) return null;
    const giveUp = () => {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return null;
    };
    if (isSoftwareRenderer(gl)) return giveUp();
    const bake = startProgram(gl, BAKE_FRAGMENT_SHADER);
    const render = startProgram(gl, RENDER_FRAGMENT_SHADER);
    if (!(await whenLinked(gl, [bake, render]))) return giveUp();
    return new MarsPlanet(gl, options, bake, render);
  }

  private constructor(
    gl: WebGLRenderingContext,
    options: PlanetOptions,
    bakeProgram: WebGLProgram,
    renderProgram: WebGLProgram,
  ) {
    this.gl = gl;
    this.options = options;
    this.bakeProgram = bakeProgram;
    this.renderProgram = renderProgram;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Every read-back happens here, before the bake queues heavy work on the GPU.
    const names: Uniform[] = ['uRes', 'uTex', 'uTexel', 'uLon0', 'uTilt', 'uSunP', 'uR', 'uBump'];
    this.uniforms = Object.fromEntries(
      names.map((name) => [name, gl.getUniformLocation(renderProgram, name)]),
    ) as Record<Uniform, WebGLUniformLocation | null>;
    const small = (options.canvas.clientWidth || 400) < SMALL_CANVAS;
    const maxSize = (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number | null) ?? 2048;
    this.textureWidth = Math.min(small ? 1024 : 2048, maxSize);

    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) throw new Error('WebGL could not create the texture');
    this.texture = texture;
    this.framebuffer = framebuffer;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.textureWidth,
      this.textureWidth / 2,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(renderProgram);
    gl.uniform1i(this.uniforms.uTex, 0);
    gl.uniform2f(this.uniforms.uTexel, 1 / this.textureWidth, 2 / this.textureWidth);
    gl.uniform1f(this.uniforms.uR, SPHERE_RADIUS);
    gl.uniform1f(this.uniforms.uBump, this.textureWidth > 1024 ? 2.6 : 1.8);
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
    if (this.bakedRows < this.textureWidth / 2) {
      this.bakeStrip();
      this.kick();
      return;
    }
    const running = this.options.shouldAnimate() && this.visible;
    if (running) {
      // Cap the step so a background tab does not jump the planet forward.
      if (this.lastTimestamp) {
        this.simulatedSeconds += Math.min(0.1, (now - this.lastTimestamp) / 1000);
      }
      this.lastTimestamp = now;
    } else {
      this.lastTimestamp = 0;
    }
    this.draw();
    if (running) this.kick();
  }

  /** Renders the next rows of the equirectangular map: RGB is albedo, alpha is height. */
  private bakeStrip(): void {
    const { gl } = this;
    const height = this.textureWidth / 2;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.useProgram(this.bakeProgram);
    gl.viewport(0, 0, this.textureWidth, height);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, this.bakedRows, this.textureWidth, BAKE_STRIP_ROWS);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.SCISSOR_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.bakedRows += BAKE_STRIP_ROWS;
    if (this.bakedRows >= height) {
      gl.deleteFramebuffer(this.framebuffer);
      gl.deleteProgram(this.bakeProgram);
    }
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
    gl.useProgram(this.renderProgram);
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
}
