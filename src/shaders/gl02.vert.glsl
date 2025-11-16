// an attribute will receive data from a buffer
attribute vec2 a_position;
// uniform mat3 u_matrix;
uniform vec2 u_resolution;
varying vec4 v_color;

void main() {
    // gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

    // covert to 0;1
    vec2 clip_space = a_position / u_resolution;
    // covert to -1;1
    clip_space = (clip_space * 2.0) - 1.0;

    gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);

    // covert clip space (-1;1) to color space (0;1)
    v_color = gl_Position * 0.5 + 0.5;
}
