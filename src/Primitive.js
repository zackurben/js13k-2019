import m4 from './Matrix';

export class Node {
  constructor({ parent } = {}) {
    this.localMatrix = m4.identity();
    this.worldMatrix = m4.identity();
    this.components = [];

    if (parent) {
      this.setParent(parent);
    }
  }

  setParent(p) {
    // remove and clean up old parent
    if (this.parent) {
      this.parent.removeComponent(this);
    }

    this.parent = p;
    this.parent.addComponent(this);
  }

  removeComponent(c) {
    if (this.components) {
      let loc = this.components.indexOf(c);
      if (loc !== -1) {
        this.components.splice(loc, 1);
      }
    }
  }

  addComponent(c) {
    this.components.push(c);
  }

  updateWorldMatrix(parentWorldMatrix) {
    if (parentWorldMatrix) {
      this.worldMatrix = m4.multiply(parentWorldMatrix, this.localMatrix);
    } else {
      this.worldMatrix = this.localMatrix.slice(0);
    }

    this.components.forEach(c => c.updateWorldMatrix(this.worldMatrix));
  }
}

export default ({ gl, Basic, Line }) => {
  class Primitive extends Node {
    constructor({
      translation = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      data = [],
      color = [Math.random(), Math.random(), Math.random(), 1],
      update = () => {},
      shader = Basic,
      parent
    } = {}) {
      super({ parent });

      this.translation = translation;
      this.rotation = rotation;
      this.scale = scale;
      this.data = data;
      this.color = color;
      if (this.color.length === 3) {
        this.color.push(1);
      }

      this.update = update;
      this.shader = shader;

      // Init the shader.
      const { vao, vbo, vbo_color } = this.shader.init(this);
      this.vao = vao;
      this.vbo = vbo;
      this.vbo_color = vbo_color;

      this.setMatrix();
    }

    render({ camera }) {
      this.shader.render(this, { camera });
    }

    setMatrix() {
      this.localMatrix = m4.translation(...this.translation);
      this.localMatrix = m4.scale(this.localMatrix, ...this.scale);
      this.localMatrix = m4.xRotate(this.localMatrix, this.rotation[0]);
      this.localMatrix = m4.yRotate(this.localMatrix, this.rotation[1]);
      this.localMatrix = m4.zRotate(this.localMatrix, this.rotation[2]);
    }
  }

  class Cube extends Primitive {
    constructor(args) {
      super({
        data: [
          // front
          -0.5,
          -0.5,
          0.5,

          0.5,
          0.5,
          0.5,

          -0.5,
          0.5,
          0.5,

          -0.5,
          -0.5,
          0.5,

          0.5,
          -0.5,
          0.5,

          0.5,
          0.5,
          0.5,

          // back
          0.5,
          -0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          0.5,
          0.5,
          -0.5,
          0.5,
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,

          // top
          -0.5,
          0.5,
          0.5,
          0.5,
          0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          -0.5,
          0.5,
          0.5,
          0.5,
          0.5,
          0.5,
          0.5,
          0.5,
          -0.5,

          // bottom
          -0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          0.5,

          // left
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          0.5,
          0.5,
          -0.5,
          0.5,
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          -0.5,
          0.5,
          -0.5,
          0.5,
          0.5,

          // right
          0.5,
          -0.5,
          0.5,
          0.5,
          0.5,
          -0.5,
          0.5,
          0.5,
          0.5,
          0.5,
          -0.5,
          0.5,
          0.5,
          -0.5,
          -0.5,
          0.5,
          0.5,
          -0.5
        ],
        ...args
      });
    }
  }

  class Plane extends Primitive {
    constructor(args) {
      super({
        data: [
          // top
          -0.5,
          0,
          0,

          0.5,
          0,
          -1,

          -0.5,
          0,
          -1,

          -0.5,
          0,
          0,

          0.5,
          0,
          0,

          0.5,
          0,
          -1
        ],
        ...args
      });
    }
  }

  class Axis extends Primitive {
    constructor(args) {
      super({
        data: [
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          1,

          0,
          0,
          0,
          -1,
          0,
          0,
          0,
          0,
          0,
          0,
          -1,
          0,
          0,
          0,
          0,
          0,
          0,
          -1
        ],
        color: [
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          1,
          1,

          0.5,
          0,
          0,
          1,
          0.5,
          0,
          0,
          1,
          0,
          0.5,
          0,
          1,
          0,
          0.5,
          0,
          1,
          0,
          0,
          0.5,
          1,
          0,
          0,
          0.5,
          1
        ],
        shader: Line,
        ...args
      });
    }
  }

  return {
    Node,
    Primitive,
    Cube,
    Plane,
    Axis
  };
};
