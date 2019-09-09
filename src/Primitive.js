import m4 from './Matrix';

export class Node {
  constructor({
    parent,
    translation = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    components = [],
    kinematic = false,
    rigid = false,
    complex = false
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

    // physics tracking
    this.lastLocalMatrix = this.localMatrix;
    this.kinematic = kinematic;
    this.rigid = rigid;
    this.complex = complex;
    this.bbox = this.boundingBox();
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

    this.components.forEach(c => c.render && c.render({ camera }));
  }

  intersects(other) {
    let a = this.bbox;
    let b = other.bbox;

    return (a.min.x <= b.max.x && a.max.x >= b.min.x) &&
         (a.min.y <= b.max.y && a.max.y >= b.min.y) &&
         (a.min.z <= b.max.z && a.max.z >= b.min.z);
  }

  boundingBox() {
    console.log('new box!');
    if (!this.data) return;

    // Break each object into tri verts
    let geom = this.data.slice(0);
    let out = [];
    let temp;
    while ((temp = geom.splice(0, 3)).length !== 0) {
      out.push([
        temp[0],
        temp[1],
        temp[2]
      ]);
    }

    let min = out[0];
    let max = out[0];
    out.forEach(([x, y, z]) => {
      min[0] = Math.min(min[0], x);
      min[1] = Math.min(min[1], y);
      min[2] = Math.min(min[2], z);
      max[0] = Math.max(max[0], x);
      max[1] = Math.max(max[1], y);
      max[2] = Math.max(max[2], z);
    });

    return {min, max};
  }

  physics(delta, objects) {
    if (!this.rigid) return;

    // If the localMatrix has changed, recalculate the bounding box
    if (this.lastLocalMatrix != this.localMatrix) {
      this.lastLocalMatrix = this.localMatrix;
      this.bbox = this.boundingBox();
    }

    objects.forEach(other => {
      if (this.intersects(other)) {
        console.log('intersection!', this, other);
      }
    })

    // Apply gravity to non-kinematic objects
    if (!this.kinematic) {
      this.localMatrix = m4.translate(this.localMatrix, 0, -9.8 * delta, 0);
    }

    // Update each child object.
    this.components.forEach(c => {
      c.physics && c.physics(delta);
    });
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
      rigid,
      kinematic,
      complex
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
