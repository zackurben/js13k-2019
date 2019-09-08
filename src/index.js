'use strict';

import StatCache from './StatCache';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import Camera from './Camera';
import Data from '../data/data.json';
import Triangulation from './Triangulator';
import { radToDisplayDeg, displayMat } from './Util';
import Input from './Input';
import m4 from './Matrix';

const canvas = document.querySelector('canvas');
const fps = document.querySelector('div');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

const { Basic, MultiColored, Line, Lighted } = Shaders(gl);
const { Node, Cube, Plane, Axis } = Primitive({ Basic, Line });
const world = new Node();
const camera = new Camera({
  translation: [0, 2, 4],
  rotation: [0, 0, 0],
  aspect: gl.canvas.clientWidth / gl.canvas.clientHeight
});
const input = Input({ canvas });
const player = new Player({
  parent: world,
  components: [camera, input],
  translation: [0, 0, 0],
  rotation: [0, 0, 0]
});

input.update = delta => {
  const _rspeed = input.viewSpeed * (delta / 1000);
  const [x, y, z] = input.getRotation().map(i => (i *= _rspeed));
  player.localMatrix = m4.multiply(player.localMatrix, m4.xRotation(x));
  player.localMatrix = m4.multiply(player.localMatrix, m4.yRotation(y));
  player.localMatrix = m4.multiply(player.localMatrix, m4.zRotation(z));

  const _speed = player.speed * (delta / 1000);
  const movement = input.getMovement().map(i => i * _speed);
  player.localMatrix = m4.translate(player.localMatrix, ...movement);
};

const FPS = new StatCache();
const DRAW = new StatCache();

let types = {
  Cube,
  Plane
};

const primary = new Cube({
  parent: world,
  translation: [1, 0, 0],
  color: [1, 1, 1],
  shader: Lighted,
  scale: [0.5, 0.5, 0.5],
  update(delta) {
    this.localMatrix = m4.yRotate(this.localMatrix, delta / 1000);
  }
});
const secondary = new Cube({
  parent: primary,
  translation: [1, 1, -1],
  color: [0.9, 0.7, 0.3],
  scale: [0.5, 0.5, 0.5],
  shader: Lighted,
  update(delta) {
    this.localMatrix = m4.yRotate(this.localMatrix, -delta / 100);
  }
});

const axis = new Axis({
  parent: world,
  scale: [10, 10, 10]
});

const map = Data.objs.map((obj, i) => {
  let { type, faces, color, normals: normal } = obj;
  const { data, normals, translation } = Triangulation(
    faces,
    Data.vertices,
    normal
  );

  return new types[type]({
    parent: world,
    data,
    translation,
    scale: [0.5, 0.5, 0.5],
    normals,
    color,
    shader: normals && normals.length !== 0 ? Lighted : Basic,
    update(delta) {
      if (i !== 0) {
        return;
      }    

      this.localMatrix = m4.yRotate(this.localMatrix, delta / 1000);
    }
  });
});

// RENDER
let lastRender = 0;
let delta;
(function render(timestamp = 0) {
  delta = timestamp - lastRender;

  // Define the viewport dimensions.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  world.updateWorldMatrix();
  world.components.forEach(item => {
    if (item.update) item.update(delta);
    if (item.updateComponents) item.updateComponents(delta);
    if (item.render) item.render({ camera });
  });

  if (fps) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    fps.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    world world: ${displayMat(world.worldMatrix)}
    player world: ${displayMat(player.worldMatrix)}
    `;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
})();
