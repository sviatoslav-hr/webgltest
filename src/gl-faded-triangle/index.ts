import { createProgram, createShader } from '../shader';
import vertexShaderSource from './faded.vert.glsl?raw';
import fragmentShaderSource from './faded.frag.glsl?raw';

interface Renderer {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
}

interface Vec2 {
  x: number;
  y: number;
}
interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export function glFadedTriangle(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) throw new Error('Failed to create vertex shader');

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!fragmentShader) throw new Error('Failed to create fragment shader');

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) throw new Error('Failed to create program');
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // standard alpha blending
  const r: Renderer = { gl, program };
  render(r);
}

function render(r: Renderer): void {
  const { gl, program } = r;
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  const GRAY = { x: 0x18 / 255, y: 0x18 / 255, z: 0x18 / 255, w: 1 };
  clearScreen(r, GRAY);

  const RED = { x: 1, y: 0, z: 0, w: 1 };
  // const BLUE = { x: 0, y: 0, z: 1, w: 1 };
  drawTriangle(
    r,
    { x: 100, y: 100 },
    { x: 650, y: 250 },
    { x: 350, y: 550 },
    RED,
  );
}

function clearScreen(r: Renderer, color: Vec4): void {
  const { gl } = r;
  gl.clearColor(color.x, color.y, color.z, color.w);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawTriangle(
  renderer: Renderer,
  p0: Vec2,
  p1: Vec2,
  p2: Vec2,
  color: Vec4,
): void {
  const { gl, program } = renderer;
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const barycentricLocation = gl.getAttribLocation(program, 'a_barycentric');
  const colorLocation = gl.getAttribLocation(program, 'a_color');
  const buffer = gl.createBuffer();
  const stride = (2 + 3 + 4) * 4; // v2 pos + v3 bary + v4 color
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // prettier-ignore
    const positions: number[] = [
      p0.x, p0.y, 1.0, 0.0, 0.0,
        color.x, color.y, color.z, color.w,
      p1.x, p1.y, 0.0, 1.0, 0.0,
        color.x, color.y, color.z, color.w,
      p2.x, p2.y, 0.0, 0.0, 1.0,
        color.x, color.y, color.z, color.w,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(barycentricLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    barycentricLocation,
    3, // v3
    gl.FLOAT,
    false,
    stride,
    2 * 4, // skip position
  );

  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    colorLocation,
    4, // v4
    gl.FLOAT,
    false,
    stride,
    (2 + 3) * 4, // skip position + bary
  );

  const offset = 0;
  const verticesPerTriangle = 3;
  const verticesCount = verticesPerTriangle * 1;
  gl.drawArrays(gl.TRIANGLES, offset, verticesCount);
}
