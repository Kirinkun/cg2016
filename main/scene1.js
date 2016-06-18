/**
 * Created by Peter on 13.06.2016.
 */

const cloudModel = {
  position: [-1, -0.4, 0, 1, -0.4, 0, 1, 0.4, 0, -1, 0.4, 0],
  normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  billNormal: [0, 0, 1],
  texture: [0, 0 /**/, 1, 0 /**/, 1, 0.4 /**/, 0, 0.4],
  index: [0, 1, 2, 2, 3, 0]
};

class Scene1 extends SceneNode {

  init() {
    this.robot = new RobotSGNode();
    this.renderRobot = new MaterialSGNode(this.robot);

    this.renderRobot.ambient = [0.24725, 0.1995, 0.0745, 1];
    this.renderRobot.diffuse = [0.75164, 0.60648, 0.22648, 1];
    this.renderRobot.specular = [0.628281, 0.555802, 0.366065, 1];
    this.renderRobot.shininess = 0.4;

    this.renderRobot = new AdvancedTextureSGNode(this.resources.simple_tex, this.renderRobot);
    this.renderRobot = new TransformationSGNode(glm.transform({rotateX: 90, rotateZ: 90, translate:[0,0.71,0]}),this.renderRobot);

    this.ufo = new UfoSGNode(0.2);
    this.ufo = new MaterialSGNode(this.ufo);

    this.ufo.ambient = [0.24725, 0.1995, 0.0745, 1];
    this.ufo.diffuse = [0.75164, 0.60648, 0.22648, 1];
    this.ufo.specular = [0.628281, 0.555802, 0.366065, 1];
    this.ufo.shininess = 0.4;

    this.cloud1 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud1 = new TransformationSGNode(glm.transform({translate: [15,-17,1]}),this.cloud1);

    this.cloud2 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud2 = new TransformationSGNode(glm.transform({translate: [8,-10,2]}),this.cloud2);

    this.cloud3 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud3 = new TransformationSGNode(glm.transform({translate: [12,-8,1]}),this.cloud3);

    this.cloud4 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud4 = new TransformationSGNode(glm.transform({translate: [4,-5,6], scale: 0.7}),this.cloud4);

    this.cloud5 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud5 = new TransformationSGNode(glm.transform({translate: [1,-3,4]}),this.cloud5);

    this.cloud6 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud6 = new TransformationSGNode(glm.transform({translate: [10,-3,1]}),this.cloud6);

    this.ufo = new AdvancedTextureSGNode(this.resources.node_tex, this.ufo);
    this.ufo = new TransformationSGNode(glm.transform({translate:[0,0.35,0]}),this.ufo);
    this.ufoPos=27;
    this.ufo = new TransformationSGNode(glm.transform({translate:[this.ufoPos, -this.ufoPos,0]}),this.ufo);

    var light = new LightSGNode([0,0,0]);
    light.ambient = [0.2, 0.2, 0.2, 1];
    light.diffuse = [0.8, 0.8, 0.8, 1];
    light.specular = [1, 1, 1, 1];

    var translateLight = new TransformationSGNode(glm.transform({translate: [0,0,-7]}));
    translateLight = new TransformationSGNode(glm.translate(0,-7,0),translateLight); //translating the light is the same as setting the light position
    translateLight.append(light);
    translateLight.append(createLightSphere(0.5,this.resources)); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source

    this.root = new TransformationSGNode(glm.transform({translate: this.pos}), this.ufo);
    this.root.append(this.renderRobot);
    this.root.append(this.cloud1);
    this.root.append(this.cloud2);
    this.root.append(this.cloud3);
    this.root.append(this.cloud4);
    this.root.append(this.cloud5);
    this.root.append(this.cloud6);
    this.root.append(translateLight);

    this.isReset=0;
  }

  reset() {
    if(this.isReset == 1) {
      return;
    }
    this.isReset = 1;
    this.headAngle=0;
    this.headAnglePerSec = 10;

    this.ufoSpeedPerSec=3/1000;
    this.ufoPos=27;
    this.ufo.matrix = glm.transform({translate:[this.ufoPos, -this.ufoPos,0]});

    this.robot.setRightArm(0);
    this.robot.setLeftArm(0);
    this.robot.setHead(this.headAngle);
    this.robot.setLegs(0);
  }


  animate(timePassed) {
    if(timePassed != 0) {
      this.headAngle += (this.headAnglePerSec/timePassed);
      this.ufoPos = this.ufoPos - this.ufoSpeedPerSec*timePassed;
      if(this.headAngle > 360 ) {
        this.headAngle -= 360;
      } if(this.ufoPos < 0) {
        this.ufoPos = 0;
      }
      this.isReset = 0;
    }

    //var calcArmAngle = Math.sin(this.armAngle)*30;
    this.ufo.matrix = glm.transform({translate: [this.ufoPos, -this.ufoPos,0]});
    this.robot.setHead(this.headAngle);
  }

  render(context) {
    super.render(context);
  }
}
