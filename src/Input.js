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
    this.viewSpeed = 1;
    this.rotation;

    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    document.addEventListener('mousemove', e => {
      if (!e.isTrusted) return;

      const {clientX, clientY, movementX, movementY, offsetX, offsetY} = e;
      console.log(clientX, clientY, movementX, movementY);
      this.rotation = [movementX, movementY, 0].map(i => parseFloat(i));
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

  getRotation() {
    if (!this.rotation) {
      return [0,0,0]
    }

    // Return the latest change and reset the rotation.
    const cache = this.rotation;
    this.rotation = [0, 0, 0];

    return cache;
  }
}
