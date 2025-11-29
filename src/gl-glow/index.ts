import { createProgram, createShader } from '../shader';
import fragmentShaderSource from './shape.frag.glsl?raw';
import vertexShaderSource from './shape.vert.glsl?raw';
import glowFragmentShaderSource from './glow.frag.glsl?raw';
import glowVertexShaderSource from './glow.vert.glsl?raw';

interface Renderer {
  gl: WebGLRenderingContext;
  fillProgram: WebGLProgram;
  glowProgram: WebGLProgram;
  fillResolution: WebGLUniformLocation | null;
  glowUniforms: GlowUniformLocations;
}

interface Vec2 {
  x: number;
  y: number;
}
interface Vec3 {
  x: number;
  y: number;
  z: number;
}
interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface GlowUniformLocations {
  resolution: WebGLUniformLocation | null;
  center: WebGLUniformLocation | null;
  color: WebGLUniformLocation | null;
  scale: WebGLUniformLocation | null;
  softness: WebGLUniformLocation | null;
  intensity: WebGLUniformLocation | null;
}

// Simple knobs to tune the glow behaviour.
const GLOW_SCALE = 1.35; // 1.35; // multiplier applied in the vertex shader
const GLOW_ALPHA = 0.5; // 0.5; // alpha used for the glow pass color
const GLOW_INTENSITY = 1.2; // 2.2; // exponent that shapes the falloff curve
const GLOW_SOFTNESS = 5.5; // 4.5; // controls how quickly the glow decays
const GLOW_WHITE_MIX = 0.15; // 0.35; // mixes white into the glow color
const WHITE: Vec4 = { x: 1, y: 1, z: 1, w: 1 };
const EPSILON = 0.0001;

export function glParticles(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) throw new Error('Failed to create vertex shader');

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!fragmentShader) throw new Error('Failed to create fragment shader');

  const fillProgram = createProgram(gl, vertexShader, fragmentShader);
  if (!fillProgram) throw new Error('Failed to create program');

  const glowVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    glowVertexShaderSource,
  );
  if (!glowVertexShader) throw new Error('Failed to create glow vertex shader');

  const glowFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    glowFragmentShaderSource,
  );
  if (!glowFragmentShader) {
    throw new Error('Failed to create glow fragment shader');
  }

  const glowProgram = createProgram(gl, glowVertexShader, glowFragmentShader);
  if (!glowProgram) throw new Error('Failed to create glow program');

  const renderer: Renderer = {
    gl,
    fillProgram,
    glowProgram,
    fillResolution: gl.getUniformLocation(fillProgram, 'u_resolution'),
    glowUniforms: {
      resolution: gl.getUniformLocation(glowProgram, 'u_resolution'),
      center: gl.getUniformLocation(glowProgram, 'u_center'),
      color: gl.getUniformLocation(glowProgram, 'u_color'),
      scale: gl.getUniformLocation(glowProgram, 'u_scale'),
      softness: gl.getUniformLocation(glowProgram, 'u_softness'),
      intensity: gl.getUniformLocation(glowProgram, 'u_intensity'),
    },
  };

  render(renderer);
}

function render(r: Renderer): void {
  const { gl, fillProgram, glowProgram, fillResolution, glowUniforms } = r;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.BLEND);

  gl.useProgram(fillProgram);
  if (fillResolution) {
    gl.uniform2f(fillResolution, gl.canvas.width, gl.canvas.height);
  }

  gl.useProgram(glowProgram);
  if (glowUniforms.resolution) {
    gl.uniform2f(glowUniforms.resolution, gl.canvas.width, gl.canvas.height);
  }

  gl.useProgram(fillProgram);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
  const vertices: Vec2[] = [p1, p2, p3];
  const edgeMask = buildUniformEdgeMask(vertices.length);
  drawShape(renderer, vertices, color, getCentroid(vertices), edgeMask);
}

function drawQuad(
  renderer: Renderer,
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  p4: Vec2,
  color: Vec4,
): void {
  const { vertices: triangles, edgeMask } = getQuadTriangles(p1, p2, p3, p4);
  const center = getCentroid([p1, p2, p3, p4]);
  drawShape(renderer, triangles, color, center, edgeMask);
}

function getQuadTriangles(
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  p4: Vec2,
): { vertices: Vec2[]; edgeMask: Vec3[] } {
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

  const triangles: [Vec2, Vec2, Vec2][] = [
    [t10, t11, t12],
    [t20, t21, t22],
  ];
  const diagEdge: [Vec2, Vec2] = [q0, q2];
  const vertices: Vec2[] = [];
  const edgeMask: Vec3[] = [];

  for (const tri of triangles) {
    const mask: Vec3 = { x: 1, y: 1, z: 1 };
    for (let i = 0; i < 3; i += 1) {
      const a = tri[(i + 1) % 3];
      const b = tri[(i + 2) % 3];
      if (edgeMatchesDiagonal(a, b, diagEdge)) {
        if (i === 0) mask.x = 0;
        if (i === 1) mask.y = 0;
        if (i === 2) mask.z = 0;
      }
    }
    vertices.push(tri[0], tri[1], tri[2]);
    edgeMask.push(mask, mask, mask);
  }

  return { vertices, edgeMask };
}

function orient(a: Vec2, b: Vec2, c: Vec2): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function edgeMatchesDiagonal(a: Vec2, b: Vec2, diag: [Vec2, Vec2]): boolean {
  return (
    (pointsEqual(a, diag[0]) && pointsEqual(b, diag[1])) ||
    (pointsEqual(a, diag[1]) && pointsEqual(b, diag[0]))
  );
}

function pointsEqual(a: Vec2, b: Vec2): boolean {
  return Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;
}

function drawShape(
  renderer: Renderer,
  vertices: Vec2[],
  color: Vec4,
  center: Vec2,
  edgeMask?: Vec3[],
): void {
  drawGlowTriangles(renderer, vertices, color, center, edgeMask);
  drawSolidTriangles(renderer, vertices, color);
}

function drawGlowTriangles(
  renderer: Renderer,
  vertices: Vec2[],
  color: Vec4,
  center: Vec2,
  edgeMask?: Vec3[],
): void {
  const { gl, glowProgram, glowUniforms } = renderer;
  if (
    !glowUniforms.center ||
    !glowUniforms.color ||
    !glowUniforms.scale ||
    !glowUniforms.softness ||
    !glowUniforms.intensity
  ) {
    return;
  }

  gl.useProgram(glowProgram);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const positionLocation = gl.getAttribLocation(glowProgram, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, toFloat32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const barycentricLocation = gl.getAttribLocation(
    glowProgram,
    'a_barycentric',
  );
  gl.enableVertexAttribArray(barycentricLocation);
  const barycentricBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, barycentricBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    buildBarycentricBuffer(vertices.length),
    gl.STATIC_DRAW,
  );
  gl.vertexAttribPointer(barycentricLocation, 3, gl.FLOAT, false, 0, 0);

  const edgeMaskLocation = gl.getAttribLocation(glowProgram, 'a_edgeMask');
  gl.enableVertexAttribArray(edgeMaskLocation);
  const edgeMaskBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, edgeMaskBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    buildEdgeMaskBuffer(vertices.length, edgeMask),
    gl.STATIC_DRAW,
  );
  gl.vertexAttribPointer(edgeMaskLocation, 3, gl.FLOAT, false, 0, 0);

  const glowColor = mixColors(color, WHITE, GLOW_WHITE_MIX);
  const glowAlpha = Math.min(1, color.w * GLOW_ALPHA);
  gl.uniform2f(glowUniforms.center, center.x, center.y);
  gl.uniform4f(
    glowUniforms.color,
    glowColor.x,
    glowColor.y,
    glowColor.z,
    glowAlpha,
  );
  gl.uniform1f(glowUniforms.scale, GLOW_SCALE);
  gl.uniform1f(glowUniforms.softness, GLOW_SOFTNESS);
  gl.uniform1f(glowUniforms.intensity, GLOW_INTENSITY);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function drawSolidTriangles(
  renderer: Renderer,
  vertices: Vec2[],
  color: Vec4,
): void {
  const { gl, fillProgram } = renderer;
  gl.useProgram(fillProgram);

  const positionLocation = gl.getAttribLocation(fillProgram, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, toFloat32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const colorLocation = gl.getAttribLocation(fillProgram, 'a_color');
  gl.enableVertexAttribArray(colorLocation);
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    buildColorBuffer(vertices.length, color),
    gl.STATIC_DRAW,
  );
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

function buildColorBuffer(vertexCount: number, color: Vec4): Float32Array {
  const colors: number[] = [];
  for (let i = 0; i < vertexCount; i += 1) {
    colors.push(color.x, color.y, color.z, color.w);
  }
  return new Float32Array(colors);
}

function buildBarycentricBuffer(vertexCount: number): Float32Array {
  const barycentrics: number[] = [];
  for (let i = 0; i < vertexCount; i += 3) {
    barycentrics.push(1, 0, 0, 0, 1, 0, 0, 0, 1);
  }
  return new Float32Array(barycentrics);
}

function buildEdgeMaskBuffer(vertexCount: number, mask?: Vec3[]): Float32Array {
  const data: number[] = [];
  if (mask && mask.length === vertexCount) {
    for (const entry of mask) {
      data.push(entry.x, entry.y, entry.z);
    }
  } else {
    for (let i = 0; i < vertexCount; i += 1) {
      data.push(1, 1, 1);
    }
  }
  return new Float32Array(data);
}

function buildUniformEdgeMask(vertexCount: number): Vec3[] {
  const mask: Vec3[] = [];
  for (let i = 0; i < vertexCount; i += 1) {
    mask.push({ x: 1, y: 1, z: 1 });
  }
  return mask;
}

function toFloat32Array(vertices: Vec2[]): Float32Array {
  const data: number[] = [];
  for (const vertex of vertices) {
    data.push(vertex.x, vertex.y);
  }
  return new Float32Array(data);
}

function getCentroid(points: Vec2[]): Vec2 {
  const sum = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    },
    { x: 0, y: 0 },
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

function mixColors(a: Vec4, b: Vec4, t: number): Vec4 {
  const mix = (channelA: number, channelB: number) =>
    channelA * (1 - t) + channelB * t;
  return {
    x: mix(a.x, b.x),
    y: mix(a.y, b.y),
    z: mix(a.z, b.z),
    w: mix(a.w, b.w),
  };
}
