import Input from './Input';
import StatCache from './StatCache';
import m4 from './Matrix';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import ShaderUtils from './shaders/ShaderUtils';
import Camera from './Camera';
import { radToDeg, degToRad, arrayAdd } from './Util';

const canvas = document.querySelector('canvas');
const fps = document.querySelector('div');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

const { createShader, createProgram } = ShaderUtils(gl);
const { Basic } = Shaders(gl);
const { Cube, Plane } = Primitive({ Basic });
const camera = Camera(gl);
const player = new Player();
const FPS = new StatCache();
const DRAW = new StatCache();

// Global modifiers
let gTranslate = [0, 0, -5];
let gRotate = [0, 0, 0];
let gScale = [1, 1, 1];

// Our list of items to render
const objs = [
  // new Plane({
  //   color: [0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1],
  //   translation: [-5, -3, 0],
  //   rotation: [0, 0, 0],
  //   shader: MultiColored
  // }),

  new Cube({
    color: [30 / 255, 40 / 255, 40 / 255, 1],
    translation: [-6, 0, -10],
    rotation: [0, 0, 0],
    update: (delta, data) => {
      data.rotation = arrayAdd(data.rotation, [0, delta / 1000, 0]);
    }
  }),

  new Plane({
    color: [90 / 255, 30 / 255, 45 / 255, 1],
    translation: [0, -3, 0],
    scale: [10, 10, 10],
    rotation: [0, 0, 0]
  })
];

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
    if (item.render)
      item.render({ gTranslate, gRotate, gScale, player, camera });
  });

  if (fps) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    fps.innerText = `frame ms: ${DRAW.get()}
    fps: ${FPS.get()}
    player position: ${JSON.stringify(player.position)}`;
  }
  lastRender = timestamp;
  return requestAnimationFrame(render);
})();
