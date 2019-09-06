'use';

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

const { Basic, MultiColored, Line } = Shaders(gl);
const { Node, Cube, Plane, Axis } = Primitive({ Basic, Line });
const world = new Node();
const camera = new Camera({
  translation: [0, 2, 4],
  rotation: [0, 0, 0],
  aspect: gl.canvas.clientWidth / gl.canvas.clientHeight
});
const input = Input({ canvas });
const player = new Player({
  translation: [0, 0, 0],
  rotation: [0, 0, 0]
});

input.update = delta => {
  const _rspeed = input.viewSpeed * (delta / 1000);
  const [x, y, z] = input.getRotation().map(i => (i *= _rspeed));
  let rotation = m4.identity();
  rotation = m4.multiply(rotation, m4.xRotation(x));
  rotation = m4.multiply(rotation, m4.yRotation(y));
  rotation = m4.multiply(rotation, m4.zRotation(z));

  const _speed = player.speed * (delta / 1000);
  const movement = input.getMovement().map(i => i * _speed);
  let translation = m4.translation(...movement);
  let out = m4.multiply(rotation, translation);

  // Get the players new location.
  player.localMatrix = m4.multiply(player.localMatrix, out);

  // Update the rotation and translation, so we can reset the matrix without
  // losing positional data.
  player.rotation = m4.addVectors(player.rotation, [x, y, z]);
  player.translation = m4.getTranslation(player.localMatrix);
  player.setMatrix();
};
player.addComponent(camera);
player.addComponent(input);

const FPS = new StatCache();
const DRAW = new StatCache();

let types = {
  Cube,
  Plane
};

const primary = new Cube({
  translation: [0, 0, 0],
  color: [1, 1, 1],
  update(delta) {
    this.rotation = m4.addVectors(this.rotation, [0, delta / 1000, 0]);
  }
});
const secondary = new Cube({
  translation: [1, 1, -1],
  color: [0.9, 0.7, 0.3],
  scale: [0.5, 0.5, 0.5],
  update(delta) {
    this.rotation = m4.addVectors(this.rotation, [0, delta / 100, 0]);
  }
});
const axis = new Axis({
  scale: [10, 10, 10]
});

world.addComponent(axis);
world.addComponent(primary);
primary.addComponent(secondary);
world.addComponent(player);

const objs = [].concat(
  Data.objs.map(obj => {
    let { type, faces, color } = obj;
    return new types[type]({
      data: Triangulation(faces, Data.vertices).flat(),
      color
    });
  }),
  [primary, secondary, axis]
);

// RENDER
// Define the viewport dimensions.
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

let lastRender = 0;
let delta;
(function render(timestamp = 0) {
  delta = timestamp - lastRender;
  world.updateWorldMatrix();
  player.update(delta);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Render each of our objects
  objs.forEach(item => {
    if (item.update) item.update(delta, item);
    if (item.setMatrix) item.setMatrix();
    if (item.render) item.render({ camera });
  });

  if (fps) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    fps.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    player translation: ${player.translation}
    player rotation: ${player.rotation.map(radToDisplayDeg)}
    camera translation: ${camera.translation}
    camera rotation: ${camera.rotation.map(radToDisplayDeg)}
    primary translation: ${primary.translation}
    primary rotation: ${primary.rotation.map(radToDisplayDeg)}
    player world: ${displayMat(player.worldMatrix)}
    camera world: ${displayMat(camera.worldMatrix)}
    `;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
})();
