import { randomInt } from '../rng';
import { createProgram, createShader } from '../shader';
import fragmentShaderSource from './gl01.frag.glsl?raw';
import vertexShaderSource from './gl01.vert.glsl?raw';

export function glFundamentals(gl: WebGLRenderingContext) {
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

  {
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // prettier-ignore
    const positions = [
      10, 20,
      80, 20,
      10, 30,
      10, 30,
      80, 20,
      80, 30,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }

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

  const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

  {
    for (let ii = 0; ii < 50; ++ii) {
      const x = randomInt(300);
      const y = randomInt(300);
      const width = randomInt(300);
      const height = randomInt(300);
      setRectangle(gl, x, y, width, height);

      const color = {
        a: 1,
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
      };
      gl.uniform4f(colorUniformLocation, color.r, color.g, color.b, color.a);

      // Draw
      const offset = 0;
      const indicesCount = 6;
      gl.drawArrays(gl.TRIANGLES, offset, indicesCount);
    }
  }
}

function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW,
  );
}
