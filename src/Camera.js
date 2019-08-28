import { degToRad } from './Util';

export default gl => {
  class Camera {
    constructor() {
      // Camera settings
      this.fieldOfViewRadians = degToRad(60);
      this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      this.zNear = 1;
      this.zFar = 2000;
    }
  }

  return {
    Camera
  };
};
