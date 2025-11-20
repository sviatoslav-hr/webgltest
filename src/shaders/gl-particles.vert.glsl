// an attribute will receive data from a buffer
attribute vec2 a_position;
attribute vec4 a_color;
uniform vec2 u_resolution;
varying vec4 v_color;

void main() {
    // covert to 0;1
    vec2 clip_space = a_position / u_resolution;
    // covert to -1;1
    clip_space = (clip_space * 2.0) - 1.0;

    gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);
    v_color = a_color;
}
