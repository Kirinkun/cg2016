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

var elapsedTime, lastTime;

const cloudModel = {
  position: [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0],
  normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  billNormal: [0, 0, 1],
  texture: [0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1],
  index: [0, 1, 2, 2, 3, 0]
};

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  gl = createContext();
  initCube();

  camera = new Camera(gl.canvas);
  var disableText = new SetUniformSGNode('u_enableObjectTexture',0);
  rootNode = new ShaderSGNode(createProgram(gl, resources.vs_texture, resources.fs_texture),disableText);
  floorNode = new TransformationSGNode(null,new RenderSGNode(cloudModel));
  floorNode.matrix = mat4.rotateX(mat4.create(),floorNode.matrix, convertDegreeToRadians(90));
  billNode = new SetUniformSGNode('u_enableObjectTexture',1,new MaterialSGNode(new AdvancedTextureSGNode(resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel)))));
  light = new LightSGNode([0,0,0]);
  light.ambient = [0.2, 0.2, 0.2, 1];
  light.diffuse = [0.8, 0.8, 0.8, 1];
  light.specular = [1, 1, 1, 1];

  let translateLight = new TransformationSGNode(glm.translate(0,0,-2)); //translating the light is the same as setting the light position

  translateLight.append(light);
  translateLight.append(createLightSphere(0.3,resources)); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
  disableText.append(translateLight);
  
  disableText.append(new TransformationSGNode(mat4.translate(mat4.create(),mat4.create(),[0,-0.5,0]),billNode));
  disableText.append(floorNode);

  this.s1 = new Scene1();
  var trans = mat4.translate(mat4.create(),mat4.create(),[-1,0,-1]);
  this.s1.setSceneTransformation(trans);
  s1.append(light);
  rootNode.append(this.s1);


  lastTime = new Date().getTime();
  elapsedTime = 0;

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

  var now = new Date().getTime();
  var frameTime = (now - lastTime)
  elapsedTime += frameTime;
  lastTime = now;
  if(elapsedTime >= 100) {
    elapsedTime -= 100;

    document.getElementById('cords').innerHTML = "Camera:<br/> x: " + Math.round(camera.pos[0]*1000)/1000 +
      "<br/> y: " + Math.round(camera.pos[1]*1000)/1000 +
      "<br/> z: " + Math.round(camera.pos[2]*1000)/1000 +
      "<br/>rot: " + camera.rotation.x+"x " + camera.rotation.y + "y";
  }

  if(this.s1.isInRange(camera.pos,3)) {
    this.s1.animate(frameTime);
  } else {
    this.s1.reset();
  }
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

function convertDegreeToRadians(degree) {
  return degree * Math.PI / 180
}

function createLightSphere(size,resources) {
  return new ShaderSGNode(createProgram(gl, resources.vs_simple, resources.fs_simple), [
  new RenderSGNode(makeSphere(size, 10, 10))]);
}

//load the shader resources using a utility function
loadResources({
  vs_view: 'shader/view.vs.glsl',
  fs_view: 'shader/view.fs.glsl',
  vs_simple: 'shader/simple.vs.glsl',
  fs_simple: 'shader/simple.fs.glsl',
  vs_texture: 'shader/texture.vs.glsl',
  fs_texture: 'shader/texture.fs.glsl',
  cloudtexture: 'models/lava.jpg'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render(0);
});
