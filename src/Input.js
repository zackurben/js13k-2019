'use strict';

export default ({
  right = 'ArrowRight',
  left = 'ArrowLeft',
  canvas
} = {}) => {
  let keys = {};

  document.addEventListener('keydown', e => {
    keys[e.code] = true;
  });

  document.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  return {
    right,
    left,
    keys,
    canvas,
    getKeys() {
      return keys;
    },

    getMovement() {
      let x = 0;
      let y = 0;
      let z = 0;
      if (keys[right]) {
        x = 1;
      }
      if (keys[left]) {
        x = -1;
      }

      return [x, y, z];
    },

    updateWorldMatrix() {}
  };
};
