import { createProgram, createShader } from '../shader';
import vertexShaderSource from './gl02.vert.glsl?raw';
import fragmentShaderSource from './gl02.frag.glsl?raw';

export function glHowItWorks(gl: WebGLRenderingContext) {
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

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionAttributeLocation);

  const resulutionUniformLocation = gl.getUniformLocation(
    program,
    'u_resolution',
  );
  gl.uniform2f(resulutionUniformLocation, gl.canvas.width, gl.canvas.height);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);
  {
    // Tell WebGL how to take data out of the buffer
    const size = 2; // components per iteration... What is 'iteration'?
    const type = gl.FLOAT; // data is 32bits
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer

    // This binds current ARRAY_BUFFER to the attribute
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );
  }
  drawScene(gl);
}

function setGeometry(gl: WebGLRenderingContext) {
  const canvas = gl.canvas;
  const { width, height } = canvas;
  const offset = 10;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // p0
      width / 2,
      (height * 1) / 4 + offset,
      // p1
      (width * 3) / 4 - offset,
      (height * 3) / 4 - offset,
      // p2
      (width * 1) / 4 + offset,
      (height * 3) / 4 - offset,
    ]),
    gl.STATIC_DRAW,
  );
}

function drawScene(gl: WebGLRenderingContext) {
  const offset = 0;
  const verticesPerTriangle = 3;
  const verticesCount = verticesPerTriangle * 1;
  gl.drawArrays(gl.TRIANGLES, offset, verticesCount);
}
