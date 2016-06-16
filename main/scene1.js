/**
 * Created by Peter on 13.06.2016.
 */

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

    this.ufo = new AdvancedTextureSGNode(this.resources.node_tex, this.ufo);
    this.ufo = new TransformationSGNode(glm.transform({translate:[0,0.35,0]}),this.ufo);

    this.ufoPos=27;
    this.ufo = new TransformationSGNode(glm.transform({translate:[this.ufoPos, -this.ufoPos,0]}),this.ufo);

    this.root = new TransformationSGNode(glm.transform({translate: this.pos}), this.ufo);

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

    this.root.append(this.renderRobot);

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
