'use strict';

import m4 from './Matrix';

export default ({
  speed = 5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
} = {}) => {
  let components = [];

  return {
    speed,
    position,
    rotation,
    scale,
    // input,
    components,
    addComponent(c) {
      this.components.push(c);
    },

    update(delta) {
      components.forEach(c => {
        if (c.update) {
          c.update(delta);
        }
      });
    },

    getView() {
      let out = m4.translate(m4.identity(), ...this.position);
      out = m4.xRotate(out, this.rotation[0]);
      out = m4.yRotate(out, this.rotation[1]);
      out = m4.zRotate(out, this.rotation[2]);
      return out;
    }
  };
};
