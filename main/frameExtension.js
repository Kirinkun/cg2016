/**
 * Created by Peter on 09.06.2016.
 */
/**
 * a light node represents a light including light position and light properties (ambient, diffuse, specular)
 * the light position will be transformed according to the current model view matrix
 */
class ColorLightSGNode extends SGNode {

  constructor(position,diffuse, children) {
    super(children);
    this.position = position || [0, 0, 0];
    this.ambient = [0, 0, 0, 1];
    this.diffuse = diffuse;
    this.specular = [1, 1, 1, 1];
    //uniform name
    this.uniform = 'u_light';

    this._worldPosition = null;
  }

  setLightUniforms(context) {
    const gl = context.gl;
    //no materials in use
    if (!context.shader || !isValidUniformLocation(gl.getUniformLocation(context.shader, this.uniform+'.ambient'))) {
      return;
    }
    gl.uniform4fv(gl.getUniformLocation(context.shader, this.uniform+'.ambient'), this.ambient);
    gl.uniform4fv(gl.getUniformLocation(context.shader, this.uniform+'.diffuse'), this.diffuse);
    gl.uniform4fv(gl.getUniformLocation(context.shader, this.uniform+'.specular'), this.specular);
  }

  setLightPosition(context) {
    const gl = context.gl;
    if (!context.shader || !isValidUniformLocation(gl.getUniformLocation(context.shader, this.uniform+'Pos'))) {
      return;
    }
    const position = this._worldPosition || this.position;
    gl.uniform3f(gl.getUniformLocation(context.shader, this.uniform+'Pos'), position[0], position[1], position[2]);
  }

  computeLightPosition(context) {
    //transform with the current model view matrix
    const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    const original = this.position;
    const position =  vec4.transformMat4(vec4.create(), vec4.fromValues(original[0], original[1],original[2], 1), modelViewMatrix);

    this._worldPosition = position;
  }

  /**
   * set the light uniforms without updating the last light position
   */
  setLight(context) {
    this.setLightPosition(context);
    this.setLightUniforms(context);
  }

  render(context) {
    this.computeLightPosition(context);
    this.setLight(context);
    //render children
    super.render(context);
  }
}
