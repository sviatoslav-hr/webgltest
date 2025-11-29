// an attribute will receive data from a buffer
attribute vec2 a_position;
attribute vec3 a_barycentric;
attribute vec4 a_color;
uniform vec2 u_resolution;
varying vec4 v_color;
varying vec3 v_barycentric;

void main() {
    // convert to 0..1
    vec2 clip_space = a_position / u_resolution;
    // convert to -1..1
    clip_space = (clip_space * 2.0) - 1.0;

    gl_Position = vec4(clip_space * vec2(1.0, -1.0), 0.0, 1.0);
    v_color = a_color;
    v_barycentric = a_barycentric;
}
