// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;
varying vec4 v_color;

void main() {
    // TODO: Add glowing effect and other particle effects.
    gl_FragColor = v_color;
}
