/**
 * Created by Peter on 13.06.2016.
 */

var s = 0.3; //size of cube
var cubeVertices = new Float32Array([
  -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s,
  -s,-s, s, s,-s, s, s, s, s, -s, s, s,
  -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s,
  s,-s,-s, s, s,-s, s, s, s, s,-s, s,
  -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s,
  -s, s,-s, -s, s, s, s, s, s, s, s,-s,
]);

var cubeIndices =  new Float32Array([
  0,1,2, 0,2,3,
  4,5,6, 4,6,7,
  8,9,10, 8,10,11,
  12,13,14, 12,14,15,
  16,17,18, 16,18,19,
  20,21,22, 20,22,23
]);

function makeCube(s) {
  var vertex = new Float32Array([
    -s,-s,-s, s,-s,-s,  /**/ s, s,-s, -s, s,-s,
    -s,-s, s, s,-s, s,  /**/ s, s, s, -s, s, s,
    -s,-s,-s, -s, s,-s, /**/ -s, s, s, -s,-s, s,
    s,-s,-s, s, s,-s,   /**/ s, s, s, s,-s, s,
    -s,-s,-s, -s,-s, s, /**/ s,-s, s, s,-s,-s,
    -s, s,-s, -s, s, s, /**/ s, s, s, s, s,-s,
  ]);

  var index =  new Float32Array([
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
  ]);

  var texture = new Float32Array( [
    0,0, 1,0, 1,1, 0,0,
    0,0, 1,0, 1,1, 0,0,
    0,0, 1,0, 1,1, 0,0,
    0,0, 1,0, 1,1, 0,0,
    0,0, 1,0, 1,1, 0,0,
    0,0, 1,0, 1,1, 0,0,
  ]);

  var normal = new Float32Array([
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1, 0,0,1
  ]);

  return {
    position: vertex,
    normal: normal,
    texture: texture,
    index: index
  }
}

var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

class CubeNode extends SGNode {

  render(context) {
      //initCube();
      //setting the model view and projection matrix on shader
      //setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);
      var modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);

      //set position
      var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
      gl.enableVertexAttribArray(positionLocation);

      //set color
      /*var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
      gl.enableVertexAttribArray(colorLocation);*/

      //set alpha
      //gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 0.5);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
      gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

      //render children
      super.render(context);
  }
}

class RobotSGNode extends SGNode {

  /*var rightArm, leftArm, legs, body, head;
  var root;*/

  constructor(children) {
    super(children);

    this.rightArm = new TransformationSGNode(mat4.create(), new RenderSGNode(makeCube(0.3)));
    this.leftArm = new TransformationSGNode(mat4.create(), new RenderSGNode(makeCube(0.3)));
    this.body = new TransformationSGNode(mat4.create(), new RenderSGNode(makeCube(0.3)));
    this.rightLeg = new TransformationSGNode(mat4.create(), new RenderSGNode(makeCube(0.3)));
    this.leftLeg = new TransformationSGNode(mat4.create(), new RenderSGNode(makeCube(0.3)));
    this.head = new TransformationSGNode(mat4.create(), new RenderSGNode(makeCube(0.3)));


    this.root = new SGNode(this.rightArm);
    this.root.append(this.leftArm);
    this.root.append(this.body);
    this.root.append(this.rightLeg);
    this.root.append(this.leftLeg);
    this.root.append(this.head);
  }

  setRightArm(angle) {
    this.rightArm.matrix = glm.transform({translate: [0.3,-0.1,0], scale: [1.2,0.22,0.3], rotateZ: angle});
  }

  setLeftArm(angle) {
    this.leftArm.matrix = glm.transform({translate: [-0.3,-0.1,0], scale: [1.2,0.22,0.3], rotateZ: angle});
  }

  setLegs(angle) {
    this.leftLeg.matrix = glm.transform({translate: [-0.2,0.5,0], scale: [0.1,0.9,0.1], rotateX: angle});
    this.rightLeg.matrix = glm.transform({translate: [0.2,0.5,0], scale: [0.1,0.9,0.1], rotateX: -angle});
  }

  setHead(angle) {
    this.head.matrix = glm.transform({translate: [0,-0.4,0], scale: [0.4,0.33,0.5], rotateY: angle});
  }

  render(context) {
    //render children
    this.root.render(context);
  }
}
