import m4 from './Matrix';
import Input from './Input';
import { arrayAdd } from './Util';

export default class Player {
  constructor(position = [0, 0, 0]) {
    this.speed = 5;
    this.position = position;
    this.input = new Input();
    this.camera = m4.identity();
  }

  getPosition() {
    return this.position;
  }

  update(delta) {
    this.updatePosition(delta);
    this.updateCamera(delta);
  }

  updatePosition(delta) {
    const _speed = this.speed * (delta / 1000);
    const movement = this.input.getMovement().map(i => i * _speed);
    this.position = arrayAdd(this.position, movement);
  }

  updateCamera(delta) {
    this.camera = m4.inverse(m4.translate(m4.identity(), ...this.position));
  }

  getCamera() {
    return this.camera;
  }
}
