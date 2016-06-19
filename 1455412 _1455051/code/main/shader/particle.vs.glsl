
attribute vec3 a_vertex;
attribute vec4 a_position_size;
attribute vec4 a_color;

uniform mat4 u_modelView;
uniform mat4 u_projection;

varying vec3 v_dist;
varying vec4 v_color;

void main() {
  vec3 vertex = a_position_size.w * a_vertex;
  mat4 modelView = u_modelView;

  modelView[3].xyzw = modelView * vec4(a_position_size.xyz, 1);

  //perpendicular billboarding
  modelView[0][0] = 1.0; modelView[0][1] = 0.0; modelView[0][2] = 0.0;
  modelView[1][0] = 0.0; modelView[1][1] = 1.0; modelView[1][2] = 0.0;
  modelView[2][0] = 0.0; modelView[2][1] = 0.0; modelView[2][2] = 1.0;

  v_dist = a_vertex;
  v_color = a_color;

  gl_Position = u_projection * modelView * vec4(vertex, 1);

}
