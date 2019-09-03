import m4 from './Matrix';
import { degToRad } from './Util';

export default (gl, {
  translation = [0, 0, 0],
  rotation = [0, 0, 0]
} = {}) => {
  let fieldOfViewRadians = degToRad(60);
  let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  let zNear = 1;
  let zFar = 2000;
  let speed = 0.1;

  return {
    fieldOfViewRadians,
    aspect,
    zNear,
    zFar,
    speed,
    translation,
    rotation,
    getProjectionMatrix() {
      return m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    },
    getMatrix() {
      let matrix = m4.identity();
      matrix = m4.xRotate(matrix, this.rotation[0]);
      matrix = m4.yRotate(matrix, this.rotation[1]);
      matrix = m4.zRotate(matrix, this.rotation[2]);
      matrix = m4.translate(matrix, ...this.translation);
      return matrix;
    }
  };
};
