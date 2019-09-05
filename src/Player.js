'use strict';

import { Node } from './Primitive';

export default class Player extends Node {
  constructor({ speed = 5, translation, rotation, scale } = {}) {
    super({
      translation,
      rotation,
      scale
    });

    this.speed = speed;
  }
}
