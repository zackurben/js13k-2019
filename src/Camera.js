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

  getProjectionMatrix() {
    return m4.perspective(
      this.fieldOfViewRadians,
      this.aspect,
      this.zNear,
      this.zFar
    );
  }
}
