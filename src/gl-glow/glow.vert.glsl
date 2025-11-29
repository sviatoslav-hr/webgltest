attribute vec2 a_position;
attribute vec3 a_barycentric;
attribute vec3 a_edgeMask;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_scale;

varying vec3 v_barycentric;
varying vec3 v_edgeMask;

void main() {
    vec2 scaled = u_center + (a_position - u_center) * u_scale;
    vec2 clip_space = scaled / u_resolution;
    clip_space = (clip_space * 2.0) - 1.0;

    gl_Position = vec4(clip_space * vec2(1.0, -1.0), 0.0, 1.0);
    v_barycentric = a_barycentric;
    v_edgeMask = a_edgeMask;
}
