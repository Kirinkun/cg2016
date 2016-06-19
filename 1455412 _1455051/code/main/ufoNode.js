/**
 * Created by Peter on 14.06.2016.
 */

s=0.3;

ufoModel= {
  position: [1, 0, -0, 0, 0, -0, 0.5, -0.25, -0.5, 0.5, 0.25, -0.5, 1, 0, -1, 0.5, 0.25, -0.5, 1, 0, -0, 1, 0, -1, 0, 0, -1, 0.5, 0.25, -0.5, 1, 0, -1, 0.5, -0.25, -0.5, 0, 0, -1, 1, 0, -0, 0.5, -0.25, -0.5, 1, 0, -1, 0.5, -0.25, -0.5, 0, 0, -1, 0.5, 0.25, -0.5, 0, 0, -1],
  normal : [0.707107, 0, 0.707107, -0.707107, 0, 0.707107, 0, -1, -1.55158e-17, 0, 1, -1.55158e-17, 0.707107, 0, -0.707107, 0, 1, -1.55158e-17, 0.707107, 0, 0.707107, 0.707107, 0, -0.707107, -0.707107, 0, -0.707107, 0, 1, -1.55158e-17, 0.707107, 0, -0.707107, 0, -1, -1.55158e-17, -0.707107, 0, -0.707107, 0.707107, 0, 0.707107, 0, -1, -1.55158e-17, 0.707107, 0, -0.707107, 0, -1, -1.55158e-17, -0.707107, 0, -0.707107, 0, 1, -1.55158e-17, -0.707107, 0, -0.707107],
  texture: [39.3701, 0, 0, 0, 19.685, -22.0085, 19.685, 22.0085, 39.3701, -35.2137, 19.685, -13.2051, 1.27079e-30, -35.2137, -39.3701, -35.2137, 0, -35.2137, -19.685, -13.2051, -39.3701, 35.2137, -19.685, 13.2051, 0, 35.2137, -3.17697e-31, 35.2137, 19.685, 13.2051, 39.3701, 35.2137, -19.685, -22.0085, -39.3701, 2.84157e-31, -19.685, 22.0085, -39.3701, 5.68313e-31],
  index: [0, 1, 2,
    0, 3, 1,
    4, 5, 6,
    7, 8, 9,
    10, 11, 12,
    13, 14, 15,
    16, 1, 17,
    18, 19, 1]

}

class UfoSGNode extends SGNode {

  constructor(size,children) {
    super(children)
    this.root = new TransformationSGNode(glm.transform({scale: size}), new RenderSGNode(ufoModel));
  }

  scale(size) {
    this.root.matrix = glm.transform({scale: size});
  }

  render(context) {
    this.root.render(context);
  }
}