
attribute vec3 a_position;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;

varying vec4 v_color;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);
  v_color = u_projection *u_modelView*vec4(0,1,1,1);
	gl_Position = u_projection * eyePosition;
}
