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

  document.addEventListener('click', e => {
    if (paused) {
      paused = false;
      canvas.requestPointerLock();
      console.log('running');
    }
  });

  document.addEventListener('mousemove', e => {
    if (!e.isTrusted) return;
    if (paused) return;

    const { clientX, clientY, movementX, movementY, offsetX, offsetY } = e;
    // console.log(clientX, clientY, movementX, movementY);
    rotation = [movementX, movementY, 0].map(i => parseFloat(i));
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
      if (keys[right]) {
        x = 1;
      }
      if (keys[left]) {
        x = -1;
      }
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
      if (keys[pause]) {
        if (!paused) {
          paused = true;
          console.log('paused');
        }
      }

      return [x, y, z];
    },

    getRotation() {
      if (!rotation) {
        return [0, 0, 0];
      }

      // Return the latest change and reset the rotation.
      const cache = rotation;
      rotation = [0, 0, 0];

      return cache.map(item => (invertedView ? -item : item));
    }
  };
};
