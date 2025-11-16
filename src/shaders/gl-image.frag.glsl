// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

uniform sampler2D u_image;

varying vec2 v_textureCoord;

void main() {
    vec4 color = texture2D(u_image, v_textureCoord);
    if (color.a < 0.1) {
        color = vec4(0, 0, 1, color.a);
    }
    gl_FragColor = color;
}
