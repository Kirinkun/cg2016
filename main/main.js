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

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  gl = createContext();

  camera = new Camera(gl.canvas);
  var disableText = new SetUniformSGNode('u_enableObjectTexture',1);
  rootNode = new AdvancedShaderSGNode(createProgram(gl, resources.vs_texture, resources.fs_texture),disableText);
  floorNode = new TransformationSGNode(null,new RenderSGNode(cloudModel));
  light3 = new AdvancedLightSGNode([0,0,0]);
  light3.ambient = [0.3, 0.3, 0.3, 1];
  light3.diffuse = [0.6, 0.6,0.6, 1];
  light3.specular = [0.5,0.5, 0.5, 1];
  floorNode.matrix = mat4.rotateX(mat4.create(),floorNode.matrix, convertDegreeToRadians(90));var m;

  translateLight = new TransformationSGNode(glm.translate(0,-7,0)); //translating the light is the same as setting the light position

  translateLight.append(light3);
  translateLight.append(createLightSphere(0.05,resources)); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
  disableText.append(translateLight);

  this.s1 = new Scene1(resources);
  this.s1.init();
  this.s1.setSceneTransformation(0,0,7);

  this.s2 = new Scene2(resources);
  this.s2.setSceneTransformation(-7,0,0);

  this.s3 = new Scene3(resources);
  this.s3.setSceneTransformation(0,0,-50);
  this.shader3 = new AdvancedShaderSGNode(createProgram(gl, resources.vs_texture, resources.fs_texture), new SetUniformSGNode('u_enableObjectTexture',1,this.s3));
  disableText.append(this.shader3);
  disableText.append(this.s1);
  disableText.append(this.s2);

  disableText.append(createWorld(10, resources));
  disableText.append(new TransformationSGNode(mat4.translate(mat4.create(),mat4.create(),[0,0,5]),new ShaderSGNode(createProgram(gl, resources.vs_particle, resources.fs_particle), new ParticlesSGNode())));
  lastTime = new Date().getTime();
  elapsedTime = 0;

  camera.initInteraction();
}

function createWorld(size, resources) {
    world = new SGNode();

    floor = new AdvancedTextureSGNode(resources.grass_tex,new RenderSGNode(makeRect(size,size)));
    floor = new TransformationSGNode(glm.transform({ translate: [0, 1, 0], rotateX : 90 }),new MaterialSGNode(floor));

    world.append(floor);

    return world;
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
  //0099CC
  gl.clearColor(0.0, 160/256, 204/256, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);


  gl.enable(gl.BLEND);
  //TASK 1-2
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  camera.animate(timeInMilliseconds);
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

    document.getElementById('cords').innerHTML = "Time: " + Math.round(timeInMilliseconds*1000)/1000000 +"s<br/>Camera:<br/> x: " + Math.round(camera.pos[0]*1000)/1000 +
      "<br/> y: " + Math.round(camera.pos[1]*1000)/1000 +
      "<br/> z: " + Math.round(camera.pos[2]*1000)/1000 +
      "<br/>rot: " + fps.value+"x " + camera.rotation.y + "y";
  }

  if(this.s1.isInRange(camera.pos,5.1)) {
    this.s1.animate(frameTime);
  } else {
    this.s1.reset();
  }
  if(this.s2.isInRange(camera.pos,5)) {
    this.s2.animate(frameTime);
  } else {
    this.s2.reset();
  }
  if(this.s3.isInRange(camera.pos,45)) {
    this.s3.animate(frameTime);
  } else {
    this.s3.reset();
  }
  rootNode.render(context);
  requestAnimationFrame(render);

}

class Camera{

  constructor(canvas){
    this.canvas = canvas;
    this.moving = 0;
    this.speed = 3.0;
    this.pos = vec3.fromValues(0,0,0);
    this.rotation = {
      x: 0,
      y: 0
    }
    this.animatedFlight = true;
    this.matrix = null;
    this.s1Started=false;
    this.s2Started=false;
    this.s3Started=false;
  }

  animate(timePassed) {
    if(this.animatedFlight == true) {
      if(timePassed < 11000) { //11 Seconds passed
        if(!this.s1Started) {
          this.s1Started = true;
          camera.pos[0] = 3;
          camera.pos[1] = -0.5;
          camera.pos[2] = 3;
          this.rotation.x = -70;
          this.rotation.y = 30;
        }
        camera.pos[0] = Math.max(3-timePassed*(0.3/1000),3);
        this.rotation.x = Math.min(-70+timePassed*(7/1000),0);
        this.rotation.y = Math.max(40-timePassed*(3/1000),10);
      } else if(timePassed < 22000) { //22 seconds passed
        if(!this.s2Started) {
          this.s2Started = true;
          camera.pos[0] = -3;
          camera.pos[1] = -1;
          camera.pos[2] = 0;
          this.rotation.x = 90;
          this.rotation.y = 0;
        }
        this.rotation.y = Math.min(0+(timePassed-11000)*(3/1000),30);
      } else if(timePassed < 33000) { //22 seconds passed
        if(!this.s3Started) {
          this.s3Started = true;
          camera.pos[0] = 0;
          camera.pos[1] = 0;
          camera.pos[2] = -10;
          this.rotation.x = 180;
          this.rotation.y = 0;
        }
        camera.pos[2] = Math.max(-10-(timePassed-22000)*(3.7/1000), -40);
      }
    }
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
      if(!camera.animatedFlight) {
        mouse.pos = toPos(event);
        mouse.leftButtonDown = event.button === 0;
      }
    });
    this.canvas.addEventListener('mousemove', function(event) {
      if(!camera.animatedFlight) {
        const pos = toPos(event);
        const delta = {x: mouse.pos.x - pos.x, y: mouse.pos.y - pos.y};
        //TASK 0-1 add delta mouse to camera.rotation if the left mouse button is pressed
        if (mouse.leftButtonDown) {
          //add the relative movement of the mouse to the rotation variables
          camera.rotation.x += delta.x;
          camera.rotation.y += delta.y;
        }
        mouse.pos = pos;
      }
    });
    canvas.addEventListener('mouseup', function(event) {
      if(!camera.animatedFlight) {
        mouse.pos = toPos(event);
        mouse.leftButtonDown = false;
      }
    });
    var upDown = false;
    var downDown = false;
    //register globally
    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyC') {
        camera.animatedFlight = false;
      }
      if(!camera.animatedFlight) {
        if (event.code === 'KeyR') {
          camera.rotation.x = 0;
          camera.rotation.y = 0;
        } else if (event.code === 'ArrowUp') {
          upDown = true;
          if (!downDown) {
            camera.moving = 1;
          }
        } else if (event.code === 'ArrowDown') {
          downDown = true;
          if (!upDown) {
            camera.moving = -1;
          }
        }
      }
    });
    document.addEventListener('keyup', function(event) {
      if(!camera.animatedFlight) {
        if (event.code === 'ArrowUp') {
          upDown = false;
          if (camera.moving == 1) {
            if (downDown) {
              camera.moving = -1;
            } else {
              camera.moving = 0;
            }
          }
        } else if (event.code === 'ArrowDown') {
          downDown = false;
          if (camera.moving == -1) {
            if (upDown) {
              camera.moving = 1;
            } else {
              camera.moving = 0;
            }
          }
        }
      }
    });
  }

  nextFrame(){
    var camRotationMatrix = mat3.fromMat4(mat3.create(), mat4.multiply(mat4.create(),
                                glm.rotateY(-camera.rotation.x),
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
  return new AdvancedShaderSGNode(createProgram(gl, resources.vs_simple, resources.fs_simple), [
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
  vs_particle: 'shader/particle.vs.glsl',
  fs_particle: 'shader/particle.fs.glsl',
  cloudtexture: 'models/Cloud.png',
  ufo: 'models/betterUfoSmooth.obj',
  simple_tex: 'models/simple.bmp',
  node_tex: 'models/Node.bmp',
  grass_tex: 'models/grass.jpg',
  sky_tex: 'models/sky.jpg',
  green_tex: 'models/green.png'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render(0);
});
