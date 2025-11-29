import { createProgram, createShader } from '../shader';
import fragmentShaderSource from './particles.frag.glsl?raw';
import vertexShaderSource from './particles.vert.glsl?raw';

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

export function glParticles(gl: WebGLRenderingContext) {
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
  drawTriangle(
    r,
    { x: 180, y: 120 },
    { x: 280, y: 220 },
    { x: 110, y: 230 },
    RED,
  );
  const BLUE = { x: 0, y: 0, z: 1, w: 1 };
  drawQuad(
    r,
    { x: 450, y: 150 },
    { x: 550, y: 160 },
    { x: 540, y: 260 },
    { x: 440, y: 250 },
    BLUE,
  );
}

function clearScreen(r: Renderer, color: Vec4): void {
  const { gl } = r;
  gl.clearColor(color.x, color.y, color.z, color.w);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawTriangle(
  renderer: Renderer,
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  color: Vec4,
): void {
  const { gl, program } = renderer;

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  const positionBuffer = gl.createBuffer();
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // prettier-ignore
    const positions: number[] = [
      p1.x, p1.y,
      p2.x, p2.y,
      p3.x, p3.y,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    // Tell WebGL how to take data out of the buffer
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  const colorLocation = gl.getAttribLocation(program, 'a_color');
  gl.enableVertexAttribArray(colorLocation);
  const colorBuffer = gl.createBuffer();
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // prettier-ignore
    const colors: number[] = [
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const size = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    // Tell WebGL how to take data out of the buffer
    gl.vertexAttribPointer(
      colorLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  const offset = 0;
  const verticesPerTriangle = 3;
  const verticesCount = verticesPerTriangle * 1;
  gl.drawArrays(gl.TRIANGLES, offset, verticesCount);
}

function drawQuad(
  renderer: Renderer,
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  p4: Vec2,
  color: Vec4,
): void {
  const { gl, program } = renderer;

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  const positionBuffer = gl.createBuffer();
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // prettier-ignore
    const positions: number[] = [];
    for (const p of getQuadTriangles(p1, p2, p3, p4)) {
      positions.push(p.x, p.y);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    // Tell WebGL how to take data out of the buffer
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  const colorLocation = gl.getAttribLocation(program, 'a_color');
  gl.enableVertexAttribArray(colorLocation);
  const colorBuffer = gl.createBuffer();
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // prettier-ignore
    const colors: number[] = [
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
      color.x, color.y, color.z, color.w,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const size = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    // Tell WebGL how to take data out of the buffer
    gl.vertexAttribPointer(
      colorLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }

  const offset = 0;
  const verticesPerTriangle = 3;
  const verticesCount = verticesPerTriangle * 2;
  gl.drawArrays(gl.TRIANGLES, offset, verticesCount);
}

function getQuadTriangles(
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  p4: Vec2,
): [Vec2, Vec2, Vec2, Vec2, Vec2, Vec2] {
  const cx = (p1.x + p2.x + p3.x + p4.x) / 4;
  const cy = (p1.y + p2.y + p3.y + p4.y) / 4;

  let v0: Vec2 = p1;
  let v1: Vec2 = p2;
  let v2: Vec2 = p3;
  let v3: Vec2 = p4;

  // Manual insertion sort of 4 (angle, vertex) pairs
  // to order points around the quad (CW/CCW)
  {
    let angle0 = Math.atan2(p1.y - cy, p1.x - cx);
    let angle1 = Math.atan2(p2.y - cy, p2.x - cx);
    let angle2 = Math.atan2(p3.y - cy, p3.x - cx);
    let angle3 = Math.atan2(p4.y - cy, p4.x - cx);

    let tmpA: number;
    let tmpV: Vec2;

    // sort (0,1)
    if (angle1 < angle0) {
      tmpA = angle0;
      angle0 = angle1;
      angle1 = tmpA;
      tmpV = v0;
      v0 = v1;
      v1 = tmpV;
    }

    // insert index 2
    if (angle2 < angle1) {
      tmpA = angle1;
      angle1 = angle2;
      angle2 = tmpA;
      tmpV = v1;
      v1 = v2;
      v2 = tmpV;

      if (angle1 < angle0) {
        tmpA = angle0;
        angle0 = angle1;
        angle1 = tmpA;
        tmpV = v0;
        v0 = v1;
        v1 = tmpV;
      }
    }

    // insert index 3
    if (angle3 < angle2) {
      tmpA = angle2;
      angle2 = angle3;
      angle3 = tmpA;
      tmpV = v2;
      v2 = v3;
      v3 = tmpV;

      if (angle2 < angle1) {
        tmpA = angle1;
        angle1 = angle2;
        angle2 = tmpA;
        tmpV = v1;
        v1 = v2;
        v2 = tmpV;

        if (angle1 < angle0) {
          tmpA = angle0;
          angle0 = angle1;
          angle1 = tmpA;
          tmpV = v0;
          v0 = v1;
          v1 = tmpV;
        }
      }
    }
  }

  const q0 = v0;
  const q1 = v1;
  const q2 = v2;
  const q3 = v3;

  // 4. Build triangles along diagonal (q0, q2), enforce CCW

  // Triangle 1: q0, q1, q2
  let t10 = q0;
  let t11 = q1;
  let t12 = q2;
  if (orient(t10, t11, t12) < 0) {
    // flip to CCW
    const tmp = t11;
    t11 = t12;
    t12 = tmp;
  }

  // Triangle 2: q0, q2, q3
  let t20 = q0;
  let t21 = q2;
  let t22 = q3;
  if (orient(t20, t21, t22) < 0) {
    const tmp = t21;
    t21 = t22;
    t22 = tmp;
  }

  return [t10, t11, t12, t20, t21, t22];
}

function orient(a: Vec2, b: Vec2, c: Vec2): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
