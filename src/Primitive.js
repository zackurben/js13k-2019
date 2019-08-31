import m4 from './Matrix';

export default ({ gl, Basic }) => {
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
      this.update = update;
      this.shader = shader;

      // Init the shader.
      const {vao, vbo} = this.shader.init(this);
      this.vao = vao;
      this.vbo = vbo;
    }

    render({ gTranslate, gRotate, gScale, player, camera }) {
      this.shader.render(this, { gTranslate, gRotate, gScale, player, camera });
    }

    getMatrix({ gTranslate, gRotate, gScale }) {
      let matrix = m4.identity();
      matrix = m4.translate(matrix, ...this.translation);
      matrix = m4.translate(matrix, ...gTranslate);
      matrix = m4.xRotate(matrix, this.rotation[0]);
      matrix = m4.xRotate(matrix, gRotate[0]);
      matrix = m4.yRotate(matrix, this.rotation[1]);
      matrix = m4.yRotate(matrix, gRotate[1]);
      matrix = m4.zRotate(matrix, this.rotation[2]);
      matrix = m4.zRotate(matrix, gRotate[2]);
      matrix = m4.scale(matrix, ...this.scale);
      matrix = m4.scale(matrix, ...gScale);
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

  return {
    Primitive,
    Cube,
    Plane
  };
};
