'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

const VERTEX_SRC = `
  attribute vec2 p;
  void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAGMENT_SRC = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_dark;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0; a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
    vec2 m = (u_mouse - 0.5 * u_res) / u_res.y;

    vec2 q = uv + 0.3 * vec2(fbm(uv * 1.3 + u_time * 0.03), fbm(uv * 1.3 - u_time * 0.04));
    float f = fbm(q * 2.0 + u_time * 0.02);
    float f2 = fbm(q * 4.0 - u_time * 0.05);

    float glow = 0.25 / (0.1 + length(uv - m * 0.4));

    vec3 violet = vec3(0.22, 0.09, 0.32);
    vec3 magenta = vec3(0.50, 0.05, 0.28);
    vec3 orange = vec3(0.92, 0.38, 0.22);
    vec3 deep = vec3(0.04, 0.02, 0.09);

    vec3 col = mix(deep, violet, f);
    col = mix(col, magenta, f2 * 0.6);
    col += orange * pow(f, 4.0) * 0.8;
    col += orange * glow * 0.08;

    if (u_dark < 0.5) {
      vec3 sky   = vec3(0.97, 0.82, 0.70);
      vec3 haze  = vec3(0.95, 0.70, 0.55);
      vec3 sand  = vec3(0.88, 0.60, 0.42);
      vec3 rust  = vec3(0.75, 0.38, 0.24);
      float horizon = smoothstep(-0.3, 0.4, uv.y);
      vec3 lcol = mix(sand, sky, horizon);
      lcol = mix(lcol, haze, f * 0.45);
      lcol = mix(lcol, rust, f2 * 0.18);
      float sun = 0.22 / (0.05 + length(uv - vec2(0.35, 0.25)));
      lcol += vec3(1.0, 0.85, 0.65) * sun * 0.04;
      col = lcol;
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Animated nebula background shader. Mouse-reactive, theme-aware
 * (cosmic violet in dark, Mars surface palette in light).
 */
export function NebulaWebGL() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const gl = (c.getContext('webgl') ??
      c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const theme = resolvedTheme ?? 'dark';

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook.
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uDark = gl.getUniformLocation(prog, 'u_dark');

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX * devicePixelRatio;
      ty = (window.innerHeight - e.clientY) * devicePixelRatio;
    };
    window.addEventListener('mousemove', onMove);

    const resize = () => {
      c.width = c.clientWidth * devicePixelRatio;
      c.height = c.clientHeight * devicePixelRatio;
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const start = performance.now();
    const loop = () => {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      gl.uniform2f(uRes, c.width, c.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uDark, theme === 'dark' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} className="mars-nebula-gl" aria-hidden="true" tabIndex={-1} />;
}
