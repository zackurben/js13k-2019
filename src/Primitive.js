import m4 from './Matrix';

export default ({ gl, Basic, Line }) => {
  class Primitive {
    constructor({
      translation = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      data = [],
      color = [Math.random(), Math.random(), Math.random(), 1],
      update = () => {},
      shader = Basic
    } = {}) {
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
    }

    render({ camera }) {
      this.shader.render(this, { camera });
    }

    getMatrix() {
      let matrix = m4.identity();
      matrix = m4.scale(matrix, ...this.scale);
      matrix = m4.translate(matrix, ...this.translation);
      matrix = m4.xRotate(matrix, this.rotation[0]);
      matrix = m4.yRotate(matrix, this.rotation[1]);
      matrix = m4.zRotate(matrix, this.rotation[2]);

      return matrix;
    }
  }

  class Cube extends Primitive {
    constructor(args) {
      super({
        data: [
          // front
          -0.5,
          -0.5,
          0,

          0.5,
          0.5,
          0,

          -0.5,
          0.5,
          0,

          -0.5,
          -0.5,
          0,

          0.5,
          -0.5,
          0,

          0.5,
          0.5,
          0,

          // back
          0.5,
          -0.5,
          -1,
          -0.5,
          0.5,
          -1,
          0.5,
          0.5,
          -1,
          0.5,
          -0.5,
          -1,
          -0.5,
          -0.5,
          -1,
          -0.5,
          0.5,
          -1,

          // top
          -0.5,
          0.5,
          0,
          0.5,
          0.5,
          -1,
          -0.5,
          0.5,
          -1,
          -0.5,
          0.5,
          0,
          0.5,
          0.5,
          0,
          0.5,
          0.5,
          -1,

          // bottom
          -0.5,
          -0.5,
          -1,
          0.5,
          -0.5,
          0,
          -0.5,
          -0.5,
          0,
          -0.5,
          -0.5,
          -1,
          0.5,
          -0.5,
          -1,
          0.5,
          -0.5,
          0,

          // left
          -0.5,
          -0.5,
          -1,
          -0.5,
          0.5,
          0,
          -0.5,
          0.5,
          -1,
          -0.5,
          -0.5,
          -1,
          -0.5,
          -0.5,
          0,
          -0.5,
          0.5,
          0,

          // right
          0.5,
          -0.5,
          0,
          0.5,
          0.5,
          -1,
          0.5,
          0.5,
          0,
          0.5,
          -0.5,
          0,
          0.5,
          -0.5,
          -1,
          0.5,
          0.5,
          -1
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
        data: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
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
          0,
          1,
          1,
          0,
          0,
          1,
          1,
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          1
        ],
        shader: Line,
        ...args
      });
    }
  }

  return {
    Primitive,
    Cube,
    Plane,
    Axis
  };
};
