precision mediump float;

varying vec3 v_barycentric;
varying vec3 v_edgeMask;

uniform vec4 u_color;
uniform float u_softness;
uniform float u_intensity;

float edgeFactor(vec3 bary, vec3 mask) {
    vec3 weighted = mix(vec3(1.0), bary, clamp(mask, 0.0, 1.0));
    return min(min(weighted.x, weighted.y), weighted.z);
}

void main() {
    float edge = edgeFactor(v_barycentric, v_edgeMask);
    float glow = 1.0 - clamp(edge * u_softness, 0.0, 1.0);
    glow = 1.0 - pow(glow, u_intensity);

    gl_FragColor = vec4(u_color.rgb, u_color.a * glow);
}
