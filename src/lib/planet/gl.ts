import { VERTEX_SHADER } from './shaders';

/* WebGL calls that read state back (link status, uniform locations...) make the main thread wait for
   the GPU. These helpers keep those reads to moments when the GPU has nothing pending. */

/** Software renderers draw the planet on the CPU: too slow, so the CSS sphere stays instead. */
export function isSoftwareRenderer(gl: WebGLRenderingContext): boolean {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  return /swiftshader|llvmpipe|software/i.test(renderer);
}

/** Compiles and links without asking for the result, so the work can run in the background. */
export function startProgram(gl: WebGLRenderingContext, fragmentSource: string): WebGLProgram {
  const program = gl.createProgram();
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (!program || !vertex || !fragment) throw new Error('WebGL could not create a program');
  gl.shaderSource(vertex, VERTEX_SHADER);
  gl.shaderSource(fragment, fragmentSource);
  gl.compileShader(vertex);
  gl.compileShader(fragment);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  return program;
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Resolves once every program has linked. With KHR_parallel_shader_compile the driver compiles off
 * the main thread and we poll once per frame; without it, the final status read waits for the GPU.
 */
export async function whenLinked(
  gl: WebGLRenderingContext,
  programs: WebGLProgram[],
): Promise<boolean> {
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (parallel) {
    while (!programs.every((p) => gl.getProgramParameter(p, parallel.COMPLETION_STATUS_KHR))) {
      await nextFrame();
    }
  }
  return programs.every((program) => gl.getProgramParameter(program, gl.LINK_STATUS));
}
