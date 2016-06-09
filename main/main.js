//the OpenGL context
var gl = null;
//our shader program
var fps = new function(){
  var lastRenderTimeInMillis = 0;
  this.evaluate = function(lastRenderTimeParam){
    this.value = 1000/(lastRenderTimeParam - lastRenderTimeInMillis);
    lastRenderTimeInMillis = lastRenderTimeParam;
  };
};

// ##################### test section start #####################

var camera;
var rootNode;
var floorNode;
var billNode;

const cloudModel = {
  position: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0, 0, -1, 0],
  normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  billNormal: [0, 0, 1],
  billUp: [0, 1, 0],
  texture: [0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1],
  index: [0, 1, 2, 2, 3, 0, 1, 0, 4]
};

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  gl = createContext(500,500);
  camera = new Camera(gl.canvas);
  rootNode = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs));
  floorNode = new TransformationSGNode(null,new RenderSGNode(cloudModel));
  floorNode.matrix = mat4.rotateX(mat4.create(),floorNode.matrix, convertDegreeToRadians(90));
  billNode = new FreeSphericalBillboardNode(cloudModel.billNormal, 0, new RenderSGNode(cloudModel)); //billNormal, true für Wolken local orientiert; billNormal, false an scene orientiert; billUp, true spherical
  //colorLight = new ColorLightSGNode([0,-0.5,0],[0,1,0,1],null);
  rootNode.append(floorNode);
  //rootNode.append(colorLight);
  rootNode.append(new TransformationSGNode(mat4.translate(mat4.create(),mat4.create(),[0,-0.5,0]),billNode));

  camera.initInteraction();
}

// ##################### test section end #####################

/**
 * render one frame
 */
function render(timeInMilliseconds) {
  checkForWindowResize(gl);
  fps.evaluate(timeInMilliseconds);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  //specify the clear color
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  camera.nextFrame();

  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);

  context.viewMatrix = camera.matrix;
  context.sceneMatrix = mat4.create();

  rootNode.render(context);
  requestAnimationFrame(render);
}

class Camera{

  constructor(canvas){
    this.canvas = canvas;
    this.moving = 0;
    this.speed = 1.0;
    this.pos = vec3.fromValues(0,0,0);
    this.rotation = {
      x: 0,
      y: 0
    }
    this.animatedFlight = true;
    this.matrix = null;
  }

  initInteraction() {
    const camera = this;
    const canvas = this.canvas;
    const mouse = {
      pos: { x : 0, y : 0},
      leftButtonDown: false
    };
    function toPos(event) {
      //convert to local coordinates
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
    canvas.addEventListener('mousedown', function(event) {
      camera.animatedFlight = false;
      mouse.pos = toPos(event);
      mouse.leftButtonDown = event.button === 0;
    });
    this.canvas.addEventListener('mousemove', function(event) {
      const pos = toPos(event);
      const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
      //TASK 0-1 add delta mouse to camera.rotation if the left mouse button is pressed
      if (mouse.leftButtonDown) {
        camera.animatedFlight = false;
        //add the relative movement of the mouse to the rotation variables
    		camera.rotation.x += delta.x;
    		camera.rotation.y += delta.y;
      }
      mouse.pos = pos;
    });
    canvas.addEventListener('mouseup', function(event) {
      camera.animatedFlight = false;
      mouse.pos = toPos(event);
      mouse.leftButtonDown = false;
    });
    var upDown = false;
    var downDown = false;
    //register globally
    document.addEventListener('keydown', function(event) {
      camera.animatedFlight = false;
      if (event.code === 'KeyR') {
        camera.rotation.x = 0;
    		camera.rotation.y = 0;
      }else if(event.code === 'ArrowUp'){
        upDown = true;
        if(!downDown){
          camera.moving = 1;
        }
      }else if(event.code === 'ArrowDown'){
        downDown = true;
        if(!upDown){
          camera.moving = -1;
        }
      }
    });
    document.addEventListener('keyup', function(event) {
      camera.animatedFlight = false;
      if(event.code === 'ArrowUp'){
        upDown = false;
        if(camera.moving == 1){
          if(downDown){
            camera.moving = -1;
          }else{
            camera.moving = 0;
          }
        }
      }else if(event.code === 'ArrowDown'){
        downDown = false;
        if(camera.moving == -1){
          if(upDown){
            camera.moving = 1;
          }else{
            camera.moving = 0;
          }
        }
      }
    });
  }

  nextFrame(){
    var camRotationMatrix = mat3.fromMat4(mat3.create(), mat4.multiply(mat4.create(),
                                glm.rotateY(camera.rotation.x),
                                glm.rotateX(camera.rotation.y)));
    var lookVec = vec3.transformMat3(vec3.create(), [0,0,1], camRotationMatrix);
    var upVec = vec3.transformMat3(vec3.create(), [0,1,0], camRotationMatrix);
    if(camera.moving != 0){
      camera.pos = vec3.add(camera.pos, camera.pos, vec3.scale(vec3.create(), lookVec, camera.speed/fps.value*camera.moving));
    }

    this.matrix =  mat4.lookAt(mat4.create(), camera.pos, vec3.add(vec3.create(), camera.pos, lookVec), upVec);
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

function convertDegreeToRadians(degree) {
  return degree * Math.PI / 180
}

//load the shader resources using a utility function
loadResources({
  vs: 'shader/simple.vs.glsl',
  fs: 'shader/simple.fs.glsl'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render(0);
});
