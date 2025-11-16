import { createProgram, createShader } from "./shader";
import vertexShaderSource from "./shaders/gl-image.vert.glsl?raw";
import fragmentShaderSource from "./shaders/gl-image.frag.glsl?raw";

const IMAGE_PATH = "./assets/character_robot_wide.png";
// const IMAGE_PATH = "./assets/leaves.jpg";

type Image = HTMLImageElement;

export function glImage(gl: WebGLRenderingContext) {
  const image = new Image();
  image.onload = () => {
    console.log("[DEBUG]: Image loaded and drawn");
    renderImage(gl, image);
  };
  image.onerror = () => {
    console.error("[ERROR]: Failed to load image");
  };
  image.src = IMAGE_PATH;
}

function renderImage(gl: WebGLRenderingContext, image: Image) {
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

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const textureCoordLocation = gl.getAttribLocation(program, "a_textureCoord");

  const positionBuffer = gl.createBuffer();
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const x = 0;
    const y = 0;
    const { width, height } = gl.canvas;
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(
      gl.ARRAY_BUFFER,
      // prettier-ignore
      new Float32Array([
        // First triangle
        // tl
        x1, y1,
        // tr
        x2, y1,
        // bl
        x1, y2,
        // Second triangle
        // bl
        x1, y2,
        // tr
        x2, y1,
        // br
        x2, y2,
      ]),
      gl.STATIC_DRAW,
    );
  }

  const textureCoordBuffer = gl.createBuffer();
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // First triangle
        // tl
        0.0, 0.0,
        // tr
        1.0, 0.0,
        // bl
        0.0, 1.0,
        // Second triangle
        // bl
        0.0, 1.0,
        // tr
        1.0, 0.0,
        // br
        1.0, 1.0,
      ]),
      gl.STATIC_DRAW,
    );
  }
  const texture = gl.createTexture();
  {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const size = 2;
    const normalized = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      positionLocation,
      size,
      gl.FLOAT,
      normalized,
      stride,
      offset,
    );
  }

  {
    gl.enableVertexAttribArray(textureCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const size = 2;
    const normalized = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      textureCoordLocation,
      size,
      gl.FLOAT,
      normalized,
      stride,
      offset,
    );
  }

  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  const offset = 0;
  const verticesCount = 6;
  gl.drawArrays(gl.TRIANGLES, offset, verticesCount);
}
