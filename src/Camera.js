import m4 from './Matrix';
import { degToRad } from './Util';

export default gl => {
  let fieldOfViewRadians = degToRad(60);
  let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  let zNear = 1;
  let zFar = 2000;

  return {
    fieldOfViewRadians,
    aspect,
    zNear,
    zFar,
    getMatrix: () => {
      return m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    }
  };
};
