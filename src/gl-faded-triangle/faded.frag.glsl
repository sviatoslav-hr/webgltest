// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec4 v_color;
varying vec3 v_barycentric;
uniform float u_time_secs;

void main() {
    vec3 b = v_barycentric;
    // 0 at edges, 1 at center
    float t = 27.0 * b.x * b.y * b.z;
    t = clamp(t, 0.0, 1.0);
    t = pow(t, 1.8); // softer
    float alpha = v_color.a;
    vec3 rgb = v_color.rgb;
    if (t <= 0.1) {
        alpha = t / 0.1; // 0-0.1 => 0-1
        alpha = max(alpha, 0.0000000001);
        // alpha = alpha * alpha;
        // alpha = sqrt(alpha);
        // rgb = rbg * t;
    }
    gl_FragColor = vec4(rgb, alpha);
}
