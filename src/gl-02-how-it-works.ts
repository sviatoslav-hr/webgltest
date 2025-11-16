import { createProgram, createShader } from "./shader";
import vertexShaderSource from "./shaders/gl02.vert.glsl?raw";
import fragmentShaderSource from "./shaders/gl02.frag.glsl?raw";

export function glHowItWorks(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) throw new Error("Failed to create vertex shader");

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!fragmentShader) throw new Error("Failed to create fragment shader");

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) throw new Error("Failed to create program");
  gl.useProgram(program);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);

  const resulutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution",
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
      // Top triangle
      // rt
      width - offset * 1.5,
      offset,
      // lt
      offset * 1.5,
      offset,
      // c
      width / 2,
      height / 2 - offset * 0.5,
      // Right triangle
      // rt
      width - offset,
      offset * 1.5,
      // c
      width / 2 + offset * 0.5,
      height / 2,
      // rb
      width - offset,
      height - offset * 1.5,
      // Bottom triangle
      // c
      width / 2,
      height / 2 + offset * 0.5,
      // rb
      width - offset * 1.5,
      height - offset,
      // lb
      offset * 1.5,
      height - offset,
      // Left triangle
      // lt
      offset,
      offset * 1.5,
      // c
      width / 2 - offset * 0.5,
      height / 2,
      // lb
      offset,
      height - offset * 1.5,
    ]),
    gl.STATIC_DRAW,
  );
}

function drawScene(gl: WebGLRenderingContext) {
  const offset = 0;
  const verticesPerTriangle = 3;
  const trianglesCount = verticesPerTriangle * 4;
  gl.drawArrays(gl.TRIANGLES, offset, trianglesCount);
}
