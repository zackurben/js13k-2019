import m4 from './Matrix';

export class Node {
  constructor({
    parent,
    translation = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    components = []
  } = {}) {
    this.localMatrix = m4.identity();
    this.worldMatrix = m4.identity();
    this.components = components;

    this.translation = translation;
    this.rotation = rotation;
    this.scale = scale;

    if (parent) {
      this.setParent(parent);
    }

    this.setMatrix();
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

  update(delta) {
    this.setMatrix();
    this.components.forEach(c => {
      if (c.update) {
        c.update(delta);
      }
    });
  }

  updateWorldMatrix(parentWorldMatrix) {
    if (parentWorldMatrix) {
      this.worldMatrix = m4.multiply(parentWorldMatrix, this.localMatrix);
    } else {
      this.worldMatrix = this.localMatrix.slice(0);
    }

    this.components.forEach(c => c.updateWorldMatrix(this.worldMatrix));
  }

  setMatrix() {
    this.localMatrix = m4.translation(...this.translation);
    this.localMatrix = m4.scale(this.localMatrix, ...this.scale);
    this.localMatrix = m4.xRotate(this.localMatrix, this.rotation[0]);
    this.localMatrix = m4.yRotate(this.localMatrix, this.rotation[1]);
    this.localMatrix = m4.zRotate(this.localMatrix, this.rotation[2]);
  }
}

export default ({ gl, Basic, Line }) => {
  class Primitive extends Node {
    constructor({
      translation,
      rotation,
      scale,
      data = [],
      color = [Math.random(), Math.random(), Math.random(), 1],
      update = () => {},
      shader = Basic,
      parent,
      normals = [],
      components
    } = {}) {
      super({ parent, components, translation, rotation, scale });

      this.data = data;
      this.normals = normals;

      this.color = color;
      if (this.color.length === 3) {
        this.color.push(1);

        if (shader != Basic) {
          const iter = parseInt(this.data.length / 3);
          const oldColor = this.color.slice(0);
          this.color = [];
          for (let i = 0; i < iter; i++) {
            this.color = this.color.concat(...oldColor);
          }
        }
      }

      this.update = update;
      this.shader = shader;

      // Init the shader.
      const { vao, vbo, vbo_color, vbo_normals } = this.shader.init(this);
      this.vao = vao;
      this.vbo = vbo;
      this.vbo_color = vbo_color;
      this.vbo_normals = vbo_normals;
    }

    render({ camera }) {
      this.shader.render(this, { camera });
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
        normals: [
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          -1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0
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
