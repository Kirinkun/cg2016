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

var cubeColors = new Float32Array([
  0,1,1, 0,1,1, 0,1,1, 0,1,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,0, 1,0,0, 1,0,0, 1,0,0,
  0,0,1, 0,0,1, 0,0,1, 0,0,1,
  1,1,0, 1,1,0, 1,1,0, 1,1,0,
  0,1,0, 0,1,0, 0,1,0, 0,1,0
]);

var cubeIndices =  new Float32Array([
  0,1,2, 0,2,3,
  4,5,6, 4,6,7,
  8,9,10, 8,10,11,
  12,13,14, 12,14,15,
  16,17,18, 16,18,19,
  20,21,22, 20,22,23
]);

function initCube() {
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

  this.cubeIndexBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
}

var cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer;

class CubeNode extends SGNode {

  render(context) {
      //setting the model view and projection matrix on shader
      setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

      //set position
      var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false,0,0) ;
      gl.enableVertexAttribArray(positionLocation);

      //set color
      var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeColorBuffer);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false,0,0) ;
      gl.enableVertexAttribArray(colorLocation);

      //set alpha
      gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 0.5);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer);
      gl.drawElements(gl.TRIANGLES, this.cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

      //render children
      super.render(context);
  }
}

class RobotSGNode extends SGNode {

  var rightArm, leftArm, legs, body, head;
  var root;

  constructor(children) {
    super(children);
    initCube();



    this.rightArm = new TransformationSGNode(mat4.create(), new CubeNode());
    this.leftArm = new TransformationSGNode(mat4.create(), new CubeNode());
    this.body = new TransformationSGNode(mat4.create(), new CubeNode());
    this.legs = new TransformationSGNode(mat4.create(), new CubeNode());
    this.head = new TransformationSGNode(headTransformationMatrix, new CubeNode());

    this.root = new SGNode(this.rightArm);
    this.root.append(this.leftArm);
    this.root.append(this.body);
    this.root.append(this.legs);
    this.root.append(this.head);
  }

  setRightArm(angle) {
    var right = mat4.multiply(mat4.create(), mat4.create(), glm.rotateZ(angle));
    right = mat4.multiply(mat4.create(), right, glm.translate(0.9,-0.1,0));
    right = mat4.multiply(mat4.create(), right, glm.scale(0.2,0.22,0.7));
    this.rightArm.setMatrix(right);
  }

  setLeftArm(angle) {
    var right = mat4.multiply(mat4.create(), mat4.create(), glm.rotateZ(angle));
    right = mat4.multiply(mat4.create(), right, glm.translate(-0.9,-0.1,0));
    right = mat4.multiply(mat4.create(), right, glm.scale(0.2,0.22,0.7));
    this.leftArm.setMatrix(right);
  }

  setLegs(angle) {
    var legTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateZ(angle));
    legTransformationMatrix = mat4.multiply(mat4.create(), legTransformationMatrix, glm.translate(0.0,-0.6,0));
    legTransformationMatrix = mat4.multiply(mat4.create(), leftLegTransformationMatrix, glm.scale(0.5,1,1));
    this.legs.setMatrix(legTransformationMatrix);
  }

  setHead(angle) {
    var headTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(angle));
    headTransformationMatrix = mat4.multiply(mat4.create(), headTransformationMatrix, glm.translate(0.0,0.4,0));
    headTransformationMatrix = mat4.multiply(mat4.create(), headTransformationMatrix, glm.scale(0.4,0.33,0.5));
    this.head.setMatrix(headTransformationMatrix);
  }

  render(context) {
    //render children
    this.root.render(context);
  }
}
