export default class Input {
  constructor({
    right = 'ArrowRight',
    left = 'ArrowLeft',
    forward = 'ArrowUp',
    back = 'ArrowDown'
  } = {}) {
    this.keys = {};
    this.right = right;
    this.left = left;
    this.forward = forward;
    this.back = back;

    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  getKeys() {
    return this.keys;
  }

  getMovement() {
    let x = 0;
    let y = 0;
    let z = 0;
    if (this.keys[this.right]) {
      x = 1;
    }
    if (this.keys[this.left]) {
      x = -1;
    }
    if (this.keys[this.forward]) {
      z = -1;
    }
    if (this.keys[this.back]) {
      z = 1;
    }

    return [x, y, z];
  }
}
