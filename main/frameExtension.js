/**
 * Created by Peter on 09.06.2016.
 */
/**
 * a color light node represents a light including light position and light properties (ambient, diffuse, specular)
 * the light position will be transformed according to the current model view matrix
 * color will be set via the "color"-matrix in constructor
 */
  /* Check this for spotlight
  http://www.tomdalling.com/blog/modern-opengl/08-even-more-lighting-directional-lights-spotlights-multiple-lights/
   */
class ColorLightSGNode extends SGNode {

  constructor(position,color, children) {
    super(children);
    this.position = position || [0, 0, 0];
    this.ambient = [[1,1,1]-color,1];
    this.diffuse = [color,1];
    this.specular = [color,1];
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

class ViewRestrictedBillboardNode extends TransformationSGNode{

  constructor(isSpherical, child){
    super(null, child);
    this.billNormal = vec3.fromValues(0,0,1);
    this.billUp = vec3.fromValues(0,1,0);
    this.billRight = vec3.fromValues(1,0,0);
    this.negBillRight = vec3.fromValues(-1,0,0);
    this.isSpherical = isSpherical;
  }

  render(context){
    var invModelViewMatrix = mat4.create();
    invModelViewMatrix = mat4.invert(invModelViewMatrix, mat4.multiply(invModelViewMatrix, context.viewMatrix, context.sceneMatrix));

    var lookVec = vec3.fromValues(
      invModelViewMatrix[12],
      invModelViewMatrix[13],
      invModelViewMatrix[14]);

    var xzLookVec = vec3.fromValues(lookVec[0], 0, lookVec[2]);

    var yAngle = vec3.angle(this.billNormal, xzLookVec);
    var xAngle = vec3.angle(xzLookVec, lookVec);

    var yAxis = vec3.cross(vec3.create(), this.billNormal, xzLookVec);
    if(Math.abs(yAxis[1]) < glMatrix.EPSILON){
      yAxis[1] = 1;
    }

    //cylindrical
    this.matrix = mat4.fromRotation(mat4.create(), yAngle, yAxis);
    //spherical
    if(this.isSpherical){
      if(lookVec[1] < 0){
        this.matrix = mat4.rotate(this.matrix, this.matrix, xAngle, this.billRight);
      }else{
        this.matrix = mat4.rotate(this.matrix, this.matrix, xAngle, this.negBillRight);
      }
    }

    super.render(context);
  }

}

class FreeSphericalBillboardNode extends TransformationSGNode{

  constructor(projBillUp, projMode, child){
    super(null, child);
    this.billNormal = vec3.fromValues(0,0,1);
    this.billUp = vec3.fromValues(0,1,0);
    this.projBillUp = projBillUp;
    this.projMode = projMode;
  }

  render(context){
    var invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
    var invSceneMatrix = mat4.invert(mat4.create(), context.sceneMatrix);

    var lookVec = vec3.fromValues(
      invViewMatrix[12] - context.sceneMatrix[12],
      invViewMatrix[13] - context.sceneMatrix[13],
      invViewMatrix[14] - context.sceneMatrix[14]);
    lookVec = vec3.transformMat3(lookVec, lookVec, mat3.fromMat4(mat3.create(), invSceneMatrix));
    var upVec = vec3.create();
    if(this.projMode == 0){
      upVec = vec3.copy(upVec, this.projBillUp);
    }else if(this.projMode == 1){
      upVec = vec3.transformMat3(upVec, this.projBillUp, mat3.fromMat4(mat3.create(), invSceneMatrix));
    }else{
      var invModelViewMatrix = mat4.multiply(mat4.create(), invSceneMatrix, invViewMatrix);
      upVec = vec3.transformMat3(upVec, this.projBillUp, mat3.fromMat4(mat3.create(), invModelViewMatrix));
    }

    //project up vector onto transformed look vector plane
    upVec = vec3.subtract(upVec, upVec, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), lookVec), vec3.dot(upVec, lookVec)/vec3.length(lookVec)));

    var normalAngle = vec3.angle(this.billNormal, lookVec);
    var normalAxis = vec3.cross(vec3.create(), this.billNormal, lookVec);
    var normalRotationMat = mat4.fromRotation(mat4.create(), normalAngle, normalAxis);
    if(normalRotationMat == null){ //TODO stimmt wahrscheinlich nicht: handle vorzeichen correctly
      normalRotationMat = mat4.create();
    }
    var normalTransformedUpVec = vec3.transformMat3(vec3.create(), this.billUp, mat3.fromMat4(mat3.create(),normalRotationMat));
    var upAngle = vec3.angle(normalTransformedUpVec, upVec);
    var upAxis = vec3.cross(vec3.create(), normalTransformedUpVec, upVec);

    var tmpMatrix = mat4.create();
    this.matrix = mat4.fromRotation(tmpMatrix, upAngle, upAxis);
    if(this.matrix == null || upAngle !== upAngle){ //TODO possibly fragile
      upAxis = lookVec;
      if(upAngle !== upAngle){
        upAngle = Math.PI;
      }
      this.matrix = mat4.fromRotation(tmpMatrix, upAngle, upAxis);
    }
    this.matrix = mat4.multiply(tmpMatrix, this.matrix, normalRotationMat);

    super.render(context);
  }
}
