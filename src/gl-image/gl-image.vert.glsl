attribute vec2 a_textureCoord;
attribute vec2 a_position;
uniform vec2 u_resolution;
varying vec2 v_textureCoord;

void main() {
    // covert to 0;1
    vec2 clip_space = a_position / u_resolution;
    // covert to -1;1
    clip_space = (clip_space * 2.0) - 1.0;

    gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);

    // GPU will interpolate this value between points
    v_textureCoord = a_textureCoord;
}
