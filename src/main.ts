import "./style.css";

function main(): void {
  const canvas = document.createElement("canvas");
  canvas.style.width = "800px";
  canvas.width = 800;
  canvas.style.height = "600px";
  canvas.height = 600;
  document.body.appendChild(canvas);

  const gl = canvas.getContext("webgl");
  if (!gl) throw new Error("WebGL not supported");

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

  // This tells WebGL how to convert from clip space (vertex shader) to screen space.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);

  {
    const positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // prettier-ignore
    const positions = [
      -1, -1,
      0, 1,
      1, -1,
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

  {
    // Draw
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);
  }
}

const vertexShaderSource = `
// an attribute will receive data from a buffer
attribute vec4 a_position;

// all shaders have a main function
void main() {
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

const fragmentShaderSource = `
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
}
`;

function createShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;

  console.log("createShader", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.log("createProgram", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

main();
