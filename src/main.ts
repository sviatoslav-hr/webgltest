import './style.css';

// import { glFundamentals } from "./gl-01-fundamentals";
// import { glHowItWorks } from "./gl-02-how-it-works";
// import { glImage } from './gl-image';
import { glParticles } from './gl-particles';
// import { glFadedTriangle } from './gl-faded-triangle';

async function main(): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.style.width = '800px';
  canvas.width = 800;
  canvas.style.height = '600px';
  canvas.height = 600;
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported');

  // This tells WebGL how to convert from clip space (vertex shader) to screen space.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // glFundamentals(gl);
  // glImage(gl);
  glParticles(gl);
  // glFadedTriangle(gl);
}

main();
