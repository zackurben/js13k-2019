import m4 from './Matrix';

export class Node {
  constructor({
    parent,
    translation = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    components = []
  } = {}) {
    this.id = `${parseInt(Math.random() * 10000000)}${parseInt(Math.random() * 10000000)}`
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
    // remove the old parent
    this.parent && this.parent.removeComponent(this);
    this.parent = p;
    this.parent.addComponent(this);
  }

  removeComponent(c) {
    let loc = this.components.indexOf(c);
    if (loc !== -1) {
      this.components.splice(loc, 1);
    }
  }

  addComponent(c) {
    this.components.push(c);
  }

  render({ camera }) {
    if (this.shader) {
      this.shader.render(this, { camera });
    }
  }

  update(delta) {}

  updateWorldMatrix(matrix) {
    if (matrix) {
      this.worldMatrix = m4.multiply(matrix, this.localMatrix);
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
      components,
      kinematic = false,
      rigid = false,
      complex = false
    } = {}) {
      super({
        parent,
        components,
        translation,
        rotation,
        scale,
        rigid,
        kinematic,
        complex
      });

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

      // physics tracking
      this._localMatrix = this.localMatrix;
      this._worldMatrix = this.worldMatrix;
      this.kinematic = kinematic;
      this.rigid = rigid;
      this.complex = complex;

      // starting bounding box
      this._boundingbox = this.getBoundingBox();
      this.boundingbox = Object.assign({}, this._boundingbox);
    }

    intersects(other) {
      let a = this.boundingbox;
      let b = other.boundingbox;

      let x = (a.min.x <= b.max.x && a.max.x >= b.min.x);
      let y = (a.min.y <= b.max.y && a.max.y >= b.min.y);
      let z = (a.min.z <= b.max.z && a.max.z >= b.min.z);

      return (
        x &&
        y &&
        z
      );
    }

    getBoundingBox() {
      if (!this.data) return;

      // Break each object into tri verts
      let geom = this.data.slice(0);
      let out = [];
      let temp;
      while ((temp = geom.splice(0, 3)).length !== 0) {
        out.push([temp[0], temp[1], temp[2]]);
      }

      let min = [0, 0, 0];
      let max = [0, 0, 0];
      out.forEach(([x, y, z]) => {
        min[0] = Math.min(min[0], x);
        min[1] = Math.min(min[1], y);
        min[2] = Math.min(min[2], z);
        max[0] = Math.max(max[0], x);
        max[1] = Math.max(max[1], y);
        max[2] = Math.max(max[2], z);
      });

      return {
        min: {
          x: min[0],
          y: min[1],
          z: min[2]
        },
        max: {
          x: max[0],
          y: max[1],
          z: max[2]
        }
      };
    }

    updateBoundingBox([x, y, z]) {
      let bb = Object.assign({}, this._boundingbox);
      return {
        min: {
          x: x + bb.min.x,
          y: y + bb.min.y,
          z: z + bb.min.z
        },
        max: {
          x: x + bb.max.x,
          y: y + bb.max.y,
          z: z + bb.max.z
        }
      };
    }

    physics(delta, objects) {
      if (!this.rigid) return;

      // If the localMatrix has changed, recalculate the bounding box
      if (this._worldMatrix != this.worldMatrix) {
        this._worldMatrix = this.worldMatrix;
        this.boundingbox = this.updateBoundingBox(
          m4.getTranslation(this.worldMatrix)
        );
      }

      let colliding = false;
      objects.filter(o => o.id !== this.id).forEach(other => {
        if (!other.rigid) return;

        // If theres an intersection, rollback the last update.
        if (this.intersects(other)) {
          this.localMatrix = this._localMatrix;
          colliding = true;
          console.log('intersection!', this, other);
        }
      });

      // Apply gravity to non-kinematic objects
      if (!this.kinematic && !colliding) {
        this.localMatrix = m4.translate(this.localMatrix, 0, -0.001 * delta, 0);
      }
    }
  }

  class Cube extends Primitive {
    constructor(args) {
      super({
        data: [
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
          -0.5,

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
        normals: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
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
