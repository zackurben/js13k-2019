'use strict';

export default ({
  right = 'ArrowRight',
  left = 'ArrowLeft',
  forward = 'ArrowUp',
  back = 'ArrowDown',
  up = 'NumpadAdd',
  down = 'NumpadSubtract',
  pause = 'Escape',
  invertedView = true,
  paused = true,
  canvas
} = {}) => {
  let keys = {};
  let viewSpeed = 1;
  let rotation;

  document.addEventListener('keydown', e => {
    keys[e.code] = true;
  });

  document.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  return {
    right,
    left,
    forward,
    back,
    up,
    down,
    pause,
    paused,
    invertedView,
    keys,
    viewSpeed,
    rotation,
    canvas,
    getKeys() {
      return keys;
    },

    getMovement() {
      let x = 0;
      let y = 0;
      let z = 0;
      if (keys[forward]) {
        z = -1;
      }
      if (keys[back]) {
        z = 1;
      }
      if (keys[up]) {
        y = 1;
      }
      if (keys[down]) {
        y = -1;
      }
      if (keys[right]) {
        x = 1;
      }
      if (keys[left]) {
        x = -1;
      }
      if (keys[pause]) {
        if (!paused) {
          paused = true;
          console.log('paused');
        }
      }

      return [x, y, z];
    },

    getRotation() {
      let x = 0;
      let y = 0;
      let z = 0;

      return [x, y, z];
    },

    updateWorldMatrix() {}
  };
};
