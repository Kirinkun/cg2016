
const MAX_PARTICLES_COUNT = 10000;
const GL_FLOAT_SIZE = 4;

const particleModel = {
  vertex: [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0],
}

class ParticlesSGNode extends RenderSGNode{

  constructor(maxParticlesCount){
    super(function(){});
    this.renderer = this.particleRenderer;
    if(maxParticlesCount !== undefined){
      this.maxParticlesCount = Math.min(maxParticlesCount, MAX_PARTICLES_COUNT);
    }else{
      this.maxParticlesCount = MAX_PARTICLES_COUNT;
    }
    this._vertex = null;
    this._position_size = null;
    this._color = null;
    this._data_position_size = new Float32Array(4 * this.maxParticlesCount);
    this._data_color = new Float32Array(4 * this.maxParticlesCount);
    this._particles = new Array(this.maxParticlesCount);
    for(var i = 0; i < this.maxParticlesCount; i++){
      this._particles[i] = {
        pos_size: vec4.create(),
        color: vec4.create(),
        speed: vec3.create(),
        cameraDistance: -1.0,
        life: 0.0
      }
    }
    this.particlesCount = 0;
    this.particleSmoothFactor = 0.5;
    this.init();
  }

  setTransformationUniforms(context){
    super.setTransformationUniforms(context);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_smoothFactor'), this.particleSmoothFactor);
  }

  init(){
    this._glExt = gl.getExtension("ANGLE_instanced_arrays");

    this._vertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleModel.vertex), gl.STATIC_DRAW);

    this._position_size = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._position_size);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * this.maxParticlesCount * GL_FLOAT_SIZE, gl.STREAM_DRAW);

    this._color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._color);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * this.maxParticlesCount * GL_FLOAT_SIZE, gl.STREAM_DRAW);

    //init particles
    this.initParticles();
  }

  particleRenderer(context){
    this.animateParticles();

    this.sortParticles(context);
    var di = 0;
    for(var i = 0; i < this.particlesCount; i++){
      this._data_color[di] = this._particles[i].color[0];
      this._data_position_size[di++] = this._particles[i].pos_size[0];
      this._data_color[di] = this._particles[i].color[1];
      this._data_position_size[di++] = this._particles[i].pos_size[1];
      this._data_color[di] = this._particles[i].color[2];
      this._data_position_size[di++] = this._particles[i].pos_size[2];
      this._data_color[di] = this._particles[i].color[3];
      this._data_position_size[di++] = this._particles[i].pos_size[3];
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this._position_size);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * this.maxParticlesCount * GL_FLOAT_SIZE, gl.STREAM_DRAW); //buffer orphaning
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this._data_position_size.buffer, 0, this.particlesCount*4));

    gl.bindBuffer(gl.ARRAY_BUFFER, this._color);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * this.maxParticlesCount * GL_FLOAT_SIZE, gl.STREAM_DRAW); //buffer orphaning
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this._data_color.buffer, 0, this.particlesCount*4));

    var vertexLoc = gl.getAttribLocation(context.shader, 'a_vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertex);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0);

    var positionSizeLoc = gl.getAttribLocation(context.shader, 'a_position_size');
    gl.bindBuffer(gl.ARRAY_BUFFER, this._position_size);
    gl.enableVertexAttribArray(positionSizeLoc);
    gl.vertexAttribPointer(positionSizeLoc, 4, gl.FLOAT, false, 0, 0);

    var colorLoc = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, this._color);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

    this._glExt.vertexAttribDivisorANGLE(vertexLoc, 0);
    this._glExt.vertexAttribDivisorANGLE(positionSizeLoc, 1);
    this._glExt.vertexAttribDivisorANGLE(colorLoc, 1);

    this._glExt.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, this.particlesCount);

    //reset divisors
    this._glExt.vertexAttribDivisorANGLE(positionSizeLoc, 0);
    this._glExt.vertexAttribDivisorANGLE(colorLoc, 0);
  }

  initParticles(){
    this.particlesCount = this.maxParticlesCount;
    this.particleSmoothFactor = 0.67;
    for(var i = 0; i < this.particlesCount; i++){
      this._particles[i].pos_size[0] = getRandomArbitrary(-0.5,0.5);
      this._particles[i].pos_size[1] = getRandomArbitrary(0.0,0.3);
      this._particles[i].pos_size[2] = getRandomArbitrary(-0.5,0.5);
      this._particles[i].pos_size[3] = 0.01;
      this._particles[i].color[0] = 0.0;
      this._particles[i].color[1] = 0.5;
      this._particles[i].color[2] = 0.0;
      this._particles[i].color[3] = 1.0;
      this._particles[i].life = 1.0;
    }
  }

  animateParticles(){
    for(var i = 0; i < this.particlesCount; i++){
      this._particles[i].speed[0] += getRandomArbitrary(-0.00002,0.00002);
      this._particles[i].speed[1] += getRandomArbitrary(-0.002,-0.01);
      this._particles[i].speed[2] += getRandomArbitrary(-0.00002,0.00002);
      this._particles[i].pos_size[3] = Math.min(Math.max(this._particles[i].pos_size[3] + getRandomArbitrary(-0.0002,0.0002), 0.001), 0.012);

      this._particles[i].pos_size = vec3.add(this._particles[i].pos_size, this._particles[i].pos_size, this._particles[i].speed);

      this._particles[i].color[1] += getRandomArbitrary(-0.2,0.4);
      this._particles[i].life -= getRandomArbitrary(0.05,0.1);
      //this._particles[i].color[2] += getRandomArbitrary(-0.002,0.003);
    }
  }

  sortParticles(context){
    var m = mat4.create();
    var mv = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    var currentCnt = 0;

    //note: particles are perpendicular billboards
    for(var i = 0; i < this.particlesCount; i++){
      m = mat4.translate(m, mv, this._particles[i].pos_size); //could be optimized to just calc m[14]
      if(this._particles[i].life >= 0) {
        currentCnt++;
      }
      this._particles[i].cameraDistance = Math.abs(m[14]);
    }
    var livingParticles = new Array(currentCnt);
    var y = 0;
    for(var i = 0; i < this.particlesCount; i++){
      if(this._particles[i].life >= 0) {
        livingParticles[y] = this._particles[i];
        y++;
      }
    }
    this._particles = livingParticles; //Now particles can die in peace.
    this.particlesCount = currentCnt;
    this._particles.sort(function(a, b) {
      return b.cameraDistance - a.cameraDistance;
    });
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
