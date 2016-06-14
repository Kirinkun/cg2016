/**
 * Created by Peter on 13.06.2016.
 */

class Scene1 extends SceneNode {

  reset() {
    this.robot = new RobotSGNode(null);

    this.root = new TransformationExtendedNode(this.pos, this.robot);
    this.headAngle=0;
    this.armAngle=0;
    this.headAnglePerSec = 100;
    this.armAnglePerSec = 1;

    this.robot.setRightArm(0);
    this.robot.setLeftArm(0);
    this.robot.setHead(this.headAngle);
    this.robot.setLegs(0);
  }


  animate(timePassed) {
    if(timePassed != 0) {
      this.headAngle += (this.headAnglePerSec/timePassed);
      this.armAngle += (this.armAnglePerSec/timePassed);
      if(this.headAngle > 360 ) {
        this.headAngle -= 360;
      }
      if(this.armAngle > 360) {
        this.armAngle -= 360;
      }
    }

    var calcArmAngle = Math.sin(this.armAngle)*30;
    this.robot.setRightArm(calcArmAngle);
    this.robot.setLeftArm(calcArmAngle);
    this.robot.setHead(this.headAngle);
    this.robot.setLegs(calcArmAngle/2);
  }

  render(context) {
    super.render(context);
  }



}
