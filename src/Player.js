'use strict';

export default ({
  speed = 5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
} = {}) => {
  return {
    speed,
    position,
    rotation,
    scale,
    components: [],
    addComponent(c) {
      this.components.push(c);
    },
    update(delta) {
      this.components.forEach(c => {
        if (c.update) {
          c.update(delta);
        }
      });
    }
  };
};
