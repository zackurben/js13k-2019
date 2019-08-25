export default class Input {
  constructor({
    right = 'ArrowRight',
    left = 'ArrowLeft',
    forward = 'ArrowUp',
    back = 'ArrowDown',
  }) {
    this.keys = {};
    this.right = right;
    this.left = left;
    this.forward = forward;
    this.back = back;

    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
    })

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    })
  }

  getKeys() {
    return this.keys;
  }

  processInput() {
    
  }
}