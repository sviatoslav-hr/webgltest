// an attribute will receive data from a buffer
attribute vec2 a_position;
uniform vec2 u_resolution;

void main() {
    // covert to 0;1
    vec2 zero_to_one = a_position / u_resolution;

    // covert to 0;2
    vec2 zero_to_two = zero_to_one * 2.0;

    // covert to -1;1
    vec2 clip_space = zero_to_two - 1.0;

    gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);
}
