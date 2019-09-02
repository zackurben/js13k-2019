import m4 from './Matrix';
import Input from './Input';
import { arrayAdd } from './Util';

export default class Player {
  constructor(
    camera,
    { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], canvas }
  ) {
    this.speed = 5;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.input = new Input({ canvas });
    this.view = m4.identity();
    this.camera = camera;
  }

  getPosition() {
    return this.position;
  }

  getRotation() {
    return this.rotation;
  }

  getScale() {
    return this.scale;
  }

  update(delta) {
    this.updatePosition(delta);
    this.updateRotation(delta);
  }

  updatePosition(delta) {
    const _speed = this.speed * (delta / 1000);
    const movement = this.input.getMovement().map(i => i * _speed);

    this.position = arrayAdd(this.position, movement);
  }

  updateRotation(delta) {
    const _speed = this.input.viewSpeed * (delta / 1000);
    const [y, x, z] = this.input.getRotation().map(i => (i *= _speed));
    this.rotation = arrayAdd(this.rotation, [x, y, z]);
  }

  getView() {
    let out = m4.translate(m4.identity(), ...this.position);
    out = m4.xRotate(out, this.rotation[0]);
    out = m4.yRotate(out, this.rotation[1]);
    out = m4.zRotate(out, this.rotation[2]);
    return out;
  }
}
