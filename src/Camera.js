import m4 from './Matrix';
import { degToRad } from './Util';

export default (gl, {
  position = [0, 0, 0],
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
    position,
    rotation,
    getProjectionMatrix() {
      return m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    },
    getMatrix() {
      let out = m4.translate(m4.identity(), ...this.position);
      out = m4.xRotate(out, this.rotation[0]);
      out = m4.yRotate(out, this.rotation[1]);
      out = m4.zRotate(out, this.rotation[2]);
      return out;
    }
  };
};
