
const particleModel = {
  position: [-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, -0.5, 0.5, 0.0, 0.5, 0.5, 0.0]
}

class ParticlesSGNode extends RenderSGNode{

  constructor(){
    super(function(){});
    this.renderer = this.particleRenderer;
  }

  particleRenderer(context){

  }

}
