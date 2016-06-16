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
    0,0, 1/4,0, 1/4,1/4, 0,0, //FRONT
    //Front has the upper quarter of the texture
    1/4,0, 2/4,0, 2/4,1/4, 1/4,0, //BACK
    2/4,0, 3/4,0, 3/4,1/4, 2/4,0, //LEFT
    3/4,0, 1,0, 1,1/4, 3/4,0, //RIGHT
    0,1/4, 1/4,1/4, 1/4,2/4, 0,1/4, //TOP
    1/4,1/4, 2/4,1/4, 2/4,2/4, 1/4,1/4  //BOTTOM
  ]);

  var normal = new Float32Array([
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    0.0,0.0,1.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    1.0,0.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0,
    0.0,1.0,0.0
  ]);

  return {
    position: vertex,
    normal: normal,
    texture: texture,
    index: index
  }
}

var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

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
