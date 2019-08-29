import Input from './Input';
import StatCache from './StatCache';
import m4 from './Matrix';
import Primitive from './Primitive';
import Player from './Player';
import Shaders from './shaders';
import Camera from './Camera';
import { radToDeg, degToRad, arrayAdd } from './Util';

const canvas = document.querySelector('canvas');
const fps = document.querySelector('div');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

const { basic } = Shaders(gl);
const { Cube, Plane } = Primitive({ gl, basic });
const camera = Camera(gl);
const player = new Player();
const FPS = new StatCache();
const DRAW = new StatCache();

// Global modifiers
let gTranslate = [0, 0, -5];
let gRotate = [0, 0, 0];
let gScale = [1, 1, 1];

// Create our primary buffer and VAO
const buffer = gl.createBuffer();
const vao = gl.createVertexArray();

// Bind our VAO
gl.bindVertexArray(vao);

// Bind our rendering buffer to the current ARRAY_BUFFER
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// Our list of items to render
const objs = [
  // front
  {
    data: [
      // one
      -0.5,
      -0.5,
      0,

      // two
      0.5,
      0.5,
      0,

      // three
      -0.5,
      0.5,
      0
    ],
    color: [255, 0, 0, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    data: [
      // one
      -0.5,
      -0.5,
      0,

      // two
      0.5,
      -0.5,
      0,

      // three
      0.5,
      0.5,
      0
    ],
    color: [0, 255, 0, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  // back
  {
    data: [
      // one
      0.5,
      -0.5,
      -1,

      // two
      -0.5,
      0.5,
      -1,

      // three
      0.5,
      0.5,
      -1
    ],
    color: [0, 255, 0, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    data: [
      // one
      0.5,
      -0.5,
      -1,

      // two
      -0.5,
      -0.5,
      -1,

      // three
      -0.5,
      0.5,
      -1
    ],
    color: [255, 0, 0, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  // top
  {
    data: [
      // one
      -0.5,
      0.5,
      0,

      //two
      0.5,
      0.5,
      -1,

      // three
      -0.5,
      0.5,
      -1
    ],
    color: [255, 0, 255, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    data: [
      // one
      -0.5,
      0.5,
      0,

      //two
      0.5,
      0.5,
      0,

      // three
      0.5,
      0.5,
      -1
    ],
    color: [255, 255, 255, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  // bottom
  {
    data: [
      // one
      -0.5,
      -0.5,
      -1,

      //two
      0.5,
      -0.5,
      0,

      // three
      -0.5,
      -0.5,
      0
    ],
    color: [255, 255, 255, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    data: [
      // one
      -0.5,
      -0.5,
      -1,

      //two
      0.5,
      -0.5,
      -1,

      // three
      0.5,
      -0.5,
      0
    ],
    color: [255, 0, 255, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  // left
  {
    data: [
      // one
      -0.5,
      -0.5,
      -1,

      //two
      -0.5,
      0.5,
      0,

      // three
      -0.5,
      0.5,
      -1
    ],
    color: [255, 255, 0, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    data: [
      // one
      -0.5,
      -0.5,
      -1,

      //two
      -0.5,
      -0.5,
      0,

      // three
      -0.5,
      0.5,
      0
    ],
    color: [0, 0, 255, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  // right
  {
    data: [
      // one
      0.5,
      -0.5,
      0,

      //two
      0.5,
      0.5,
      -1,

      // three
      0.5,
      0.5,
      0
    ],
    color: [0, 0, 255, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  {
    data: [
      // one
      0.5,
      -0.5,
      0,

      //two
      0.5,
      -0.5,
      -1,

      // three
      0.5,
      0.5,
      -1
    ],
    color: [255, 255, 0, 1],
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },

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

  // Tell it to use our program (pair of shaders)
  // gl.useProgram(basic.shader);

  // Bind the attribute/buffer set we want.
  // gl.bindVertexArray(vao);

  // Render each of our objects
  objs.forEach(item => {
    if (item.update) item.update(delta, item);
    if (item.render)
      item.render({ vao, gTranslate, gRotate, gScale, camera, player });
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
