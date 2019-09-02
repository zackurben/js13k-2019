import Input from './Input';
import StatCache from './StatCache';
import m4 from './Matrix';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import ShaderUtils from './shaders/ShaderUtils';
import Camera from './Camera';
import { radToDeg, degToRad, arrayAdd } from './Util';
import Data from '../data/data.json';
import Triangulation from './Triangulator';

const canvas = document.querySelector('canvas');
const fps = document.querySelector('div');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

const { createShader, createProgram } = ShaderUtils(gl);
const { Basic, MultiColored } = Shaders(gl);
const { Cube, Plane } = Primitive({ Basic });
const camera = Camera(gl);
const player = new Player(camera, {
  position: [0, 2, 10],
  rotation: [0, 0, 0],
  canvas
});
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
    if (item.render) item.render({ player });
  });

  if (fps) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    fps.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    player position: ${JSON.stringify(player.position)}
    player rotation: ${JSON.stringify(player.rotation)}`;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
})();
