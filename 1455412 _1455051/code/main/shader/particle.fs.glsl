precision mediump float;

uniform float u_smoothFactor;

varying vec3 v_dist;
varying vec4 v_color;

void main() {
	float t = u_smoothFactor/length(v_dist);

	if(t < u_smoothFactor){
		t = 0.0;
	}
	vec4 c = v_color;
	gl_FragColor = vec4(c.xyz,t);
}
