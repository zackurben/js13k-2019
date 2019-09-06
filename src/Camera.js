import m4 from './Matrix';
import { degToRad } from './Util';
import { Node } from './Primitive';

export default class Camera extends Node {
  constructor({
    up = [0, 1, 0],
    target = [0, 0, -1],
    aspect = 1,
    fieldOfViewRadians = degToRad(60),
    zNear = 1,
    zFar = 2000,
    speed = 0.1,
    translation,
    rotation,
    scale
  } = {}) {
    super({ translation, rotation, scale });

    this.up = up;
    this.target = target;
    this.fieldOfViewRadians = fieldOfViewRadians;
    this.aspect = aspect;
    this.zNear = zNear;
    this.zFar = zFar;
    this.speed = speed;
  }

  // setMatrix() {
  //   this.localMatrix = m4.translation(...this.translation);
  //   // this.localMatrix = m4.xRotate(this.localMatrix, this.rotation[0]);
  //   // this.localMatrix = m4.yRotate(this.localMatrix, this.rotation[1]);
  //   // this.localMatrix = m4.zRotate(this.localMatrix, this.rotation[2]);

  //   // this.localMatrix = m4.lookAt(this.localMatrix, m4.addVectors(this.translation, [0, 0, -1]), [0, 1, 0])
  // }

  getProjectionMatrix() {
    return m4.perspective(
      this.fieldOfViewRadians,
      this.aspect,
      this.zNear,
      this.zFar
    );
  }
}
