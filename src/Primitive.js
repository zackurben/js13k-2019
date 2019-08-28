import m4 from './Matrix';

export default ({ gl, basic }) => {
  class Primitive {
    constructor({
      translation = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      data = [],
      color = [Math.random(), Math.random(), Math.random(), 1],
      update = () => {},
      shader = basic
    } = {}) {
      this.translation = translation;
      this.rotation = rotation;
      this.scale = scale;
      this.data = data;
      this.color = color;
      this.update = update;
      this.shader = shader;
    }

    render({ gTranslate, gRotate, gScale, camera, player }) {
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.data),
        gl.STATIC_DRAW
      );
      gl.uniform4f(this.shader.attributes.u_color, ...this.color);
      gl.uniformMatrix4fv(
        this.shader.attributes.u_model,
        false,
        this.getMatrix({ gTranslate, gRotate, gScale })
      );
      gl.uniformMatrix4fv(
        this.shader.attributes.u_view,
        false,
        player.getCamera()
      );
      gl.uniformMatrix4fv(
        this.shader.u_projection,
        false,
        m4.perspective(
          camera.fieldOfViewRadians,
          camera.aspect,
          camera.zNear,
          camera.zFar
        )
      );

      const offset = 0;
      gl.drawArrays(
        gl.TRIANGLES,
        offset,
        this.data.length / this.shader.data.size
      );
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
