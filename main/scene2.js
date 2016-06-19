/**
 * Created by Peter on 13.06.2016.
 */

class Scene2 extends SceneNode {

  init() {
    this.robot = new RobotSGNode();
    this.renderRobot = new MaterialSGNode(this.robot);

    this.renderRobot.ambient = [0.24725, 0.1995, 0.0745, 1];
    this.renderRobot.diffuse = [0.75164, 0.60648, 0.22648, 1];
    this.renderRobot.specular = [0.628281, 0.555802, 0.366065, 1];
    this.renderRobot.shininess = 0.4;

    this.renderRobot = new AdvancedTextureSGNode(this.resources.simple_tex, this.renderRobot);
    this.renderRobot = new TransformationSGNode(glm.transform({rotateY: 270, translate:[0,0.27,0]}),this.renderRobot);

    this.ufo = new UfoSGNode(0.2);
    this.ufo = new MaterialSGNode(this.ufo);

    this.ufo.ambient = [0.24725, 0.1995, 0.0745, 1];
    this.ufo.diffuse = [0.75164, 0.60648, 0.22648, 1];
    this.ufo.specular = [0.628281, 0.555802, 0.366065, 1];
    this.ufo.shininess = 0.4;

    this.cloud1 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud1 = new TransformationSGNode(glm.transform({translate: [-5,-4,1]}),this.cloud1);

    this.cloud2 = new MaterialSGNode(new AdvancedTextureSGNode(this.resources.cloudtexture, new ViewRestrictedBillboardNode(true, new RenderSGNode(cloudModel))));
    this.cloud2 = new TransformationSGNode(glm.transform({translate: [-8,-6,-3]}),this.cloud2);

    this.ufo = new AdvancedTextureSGNode(this.resources.node_tex, this.ufo);
    this.ufoRot = new TransformationSGNode(glm.transform({rotateY:0}),this.ufo);
    this.ufoScaleN = new TransformationSGNode(glm.transform({scale:1}),this.ufoRot);
    this.ufoTrans = new TransformationSGNode(glm.transform({translate:[-0.15,0.2,0.7]}),this.ufoScaleN);

    this.root = new TransformationSGNode(glm.transform({translate: this.pos}), this.ufoTrans);
    this.root.append(this.renderRobot);
    this.root.append(this.cloud2);
    this.root.append(this.cloud1);

    this.ufoScalePerSec=1.8/1000;
    this.ufoMoveSpeed=0.6/1000;
    this.ufoScale=1;

    this.isReset=0;
  }

  reset() {
    if(this.isReset == 1) {
      return;
    }
    this.isReset = 1;
    this.headAngle=0;
    this.headAnglePerSec = 10;
    this.ufoPos = 0;

    this.robot.setRightArm(30);
    this.robot.setLeftArm(0);
    this.robot.setHead(this.headAngle);
    this.robot.setLegs(0);

    this.ufoScalePerSec=2.2/1000;
    this.ufoMoveSpeed=0.6/1000;
    this.ufoScale=1;
    this.ufoScaleN.matrix = glm.transform({scale: this.ufoScale});
    this.ufoTrans.matrix = glm.transform({translate: [-0.15-(this.ufoPos/5),(0.2-this.ufoPos),(0.70+this.ufoPos/3)]});
    this.robot.setHead(this.headAngle);
  }


  animate(timePassed) {
    if(timePassed != 0) {
      this.headAngle += (this.headAnglePerSec/timePassed);
      this.ufoPos = this.ufoPos + this.ufoMoveSpeed*timePassed;
      this.ufoScale = this.ufoScale + this.ufoScalePerSec*timePassed;
      if(this.headAngle > 360 ) {
        this.headAngle -= 360;
      } if(this.ufoPos > 5.3) {
        this.ufoPos = 5.3;
      } if(this.ufoScale > 20) {
        this.ufoScale = 20;
      }
      this.isReset = 0;
    }

    //this.ufoRot.matrix = glm.transform({rotateY: this.headAngle*3/2});
    this.ufoScaleN.matrix = glm.transform({scale: this.ufoScale});
    this.ufoTrans.matrix = glm.transform({translate: [-0.15-(this.ufoPos/5),(0.2-this.ufoPos),(0.70+this.ufoPos/3)]});
    this.robot.setHead(this.headAngle);
  }

  render(context) {
    super.render(context);
  }
}
