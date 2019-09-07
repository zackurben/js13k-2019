'use strict';

import { Node } from './Primitive';

export default class Player extends Node {
  constructor({ speed = 5, translation, rotation, scale, parent, components } = {}) {
    super({
      translation,
      rotation,
      scale,
      parent,
      components
    });

    this.speed = speed;
  }
}
