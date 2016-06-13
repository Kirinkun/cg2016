/**
 * Created by Peter on 13.06.2016.
 */

class Scene1 extends SceneNode {

  reset() {
    this.robot = new RobotSGNode(null);
    this.root.append(this.robot);
  }



  render(context) {

    if(this.isInRange(camera.pos,5)) {
      console.log("Hello");
    }

    this.robot.setRightArm(-30);
    this.robot.setLeftArm(-30);
    this.robot.setHead(20);
    //this.robot.setBody(0);
    this.robot.setLegs(15);

    super.render(context);
  }



}
