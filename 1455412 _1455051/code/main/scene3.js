/**
 * Created by Peter on 13.06.2016.
 */

class Scene3 extends SceneNode {

  init() {
    this.ufo = new UfoSGNode(20);
    this.ufo = new MaterialSGNode(this.ufo);

    this.ufo.ambient = [0.24725, 0.1995, 0.0745, 1];
    this.ufo.diffuse = [0.75164, 0.60648, 0.22648, 1];
    this.ufo.specular = [0.628281, 0.555802, 0.366065, 1];
    this.ufo.shininess = 0.4;

    this.ufo = new AdvancedTextureSGNode(this.resources.node_tex, this.ufo);
    this.ufoRot = new TransformationSGNode(glm.transform({rotateX:90}),this.ufo);
    this.ufoScaleN = new TransformationSGNode(glm.transform({scale:1}),this.ufoRot);
    this.ufoTrans = new TransformationSGNode(glm.transform({translate:[-10,-10,0]}),this.ufoScaleN);

    this.cube = new AdvancedTextureSGNode(this.resources.green_tex, new MaterialSGNode(new RenderSGNode(makeCube(0.3))));
    this.cubeRot = new TransformationSGNode(glm.transform({rotateX: 45, rotateY: 45}),this.cube);
    this.cubeTrans = new TransformationSGNode(glm.transform({translate:[0,-0.08,5.5]}),this.cubeRot);

    var light = new AdvancedLightSGNode([0,0,5.5]);
    light.ambient = [0.1, 0.3, 0.2, 1];
    light.diffuse = [0.2, 0.2, 0.2, 1];
    light.specular = [0.1, 0.1, 0.1, 1];

    this.cubeTrans.append(light);

    this.root = new TransformationSGNode(glm.transform({translate: this.pos}), this.ufoTrans);
    this.root.append(this.cubeTrans);

    this.particleNode = new ShaderSGNode(createProgram(gl, this.resources.vs_particle, this.resources.fs_particle));
    this.cubeTrans.append(this.particleNode);

    this.isReset=0;
    this.cubeRotSpeed=120/1000;
  }

  reset() {
    if(this.isReset == 1) {
      return;
    }
    this.isReset = 1;
    this.cubeRot.matrix=glm.transform({rotateX: 45, rotateY: 45});
    this.rotPos=45;
    this.cubeRotSpeed=120/1000;
    this.resetParticles();
  }

  resetParticles() {
    this.cubeTrans.remove(this.particleNode);
    this.particleNode = new ShaderSGNode(createProgram(gl, this.resources.vs_particle, this.resources.fs_particle));
    this.cubeTrans.append(this.particleNode); //Basically reset the node.
  }

  animate(timePassed) {
    if(timePassed != 0)
    {
      this.rotPos += this.cubeRotSpeed*timePassed;
      if(this.rotPos > 360) {
        this.rotPos -= 360;
      }
      this.isReset = 0;
    }
    this.cubeRot.matrix=glm.transform({rotateZ: this.rotPos, rotateY: 45});
    this.particleNode.append(new ParticlesSGNode(Math.round(timePassed/6)));
  }

  render(context) {
    super.render(context);
  }
}
