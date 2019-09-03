import StatCache from './StatCache';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import Camera from './Camera';
import Data from '../data/data.json';
import Triangulation from './Triangulator';
import { arrayAdd, radToDisplayDeg } from './Util';
import Input from './Input';

const canvas = document.querySelector('canvas');
const fps = document.querySelector('div');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

const { Basic, MultiColored } = Shaders(gl);
const { Cube, Plane } = Primitive({ Basic });
const camera = Camera(gl);
const input = Input({ canvas });
const player = Player({
  translation: [0, 0, 0],
  rotation: [0, 0, 0]
});
const cameraOffset = [0, 2, 0];

// Add a camera script to follow the player.
camera.update = delta => {
  camera.translation = arrayAdd(player.translation, cameraOffset);
  camera.rotation = player.rotation;
};
input.update = delta => {
  const _speed = player.speed * (delta / 1000);
  const movement = input.getMovement().map(i => i * _speed);
  player.translation = arrayAdd(player.translation, movement);

  const _rspeed = input.viewSpeed * (delta / 1000);
  const [y, x, z] = input.getRotation().map(i => (i *= _rspeed));
  player.rotation = arrayAdd(player.rotation, [x, y, z]);
};
player.addComponent(camera);
player.addComponent(input);

const FPS = new StatCache();
const DRAW = new StatCache();

let types = {
  Cube,
  Plane
};

const objs = Data.objs.map(obj => {
  let { type, faces, color } = obj;
  return new types[type]({
    data: Triangulation(faces, Data.vertices).flat(),
    color
  });
});

// RENDER
// Define the viewport dimensions.
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

let lastRender = 0;
let delta;
(function render(timestamp = 0) {
  delta = timestamp - lastRender;
  player.update(delta);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Render each of our objects
  objs.forEach(item => {
    if (item.update) item.update(delta, item);
    if (item.render) item.render({ camera });
  });

  if (fps) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    fps.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    player translation: ${JSON.stringify(player.translation)}
    player rotation: ${JSON.stringify(player.rotation.map(radToDisplayDeg))}
    camera translation: ${JSON.stringify(camera.translation)}
    camera rotation: ${JSON.stringify(camera.rotation.map(radToDisplayDeg))}
    `;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
})();
