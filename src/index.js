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

const {createShader, createProgram } = ShaderUtils(gl);
const { basic } = Shaders(gl);
const { Cube, Plane } = Primitive({ basic });
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

// // Bind our VAO
// gl.bindVertexArray(vao);

// // Enable our shader attribute
// gl.enableVertexAttribArray(basic.attributes.a_position);

// // Bind our rendering buffer to the current ARRAY_BUFFER
// gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// const size = 3; // 3 components per iteration
// const type = gl.FLOAT; // the data is 32bit floats
// const normalize = false; // don't normalize the data
// const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
// const offset = 0; // start at the beginning of the buffer
// gl.vertexAttribPointer(
//   basic.attributes.a_position,
//   size,
//   type,
//   normalize,
//   stride,
//   offset
// );

// Our list of items to render
const objs = [
  // front
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     -0.5,
  //     0,

  //     // two
  //     0.5,
  //     0.5,
  //     0,

  //     // three
  //     -0.5,
  //     0.5,
  //     0
  //   ],
  //   color: [255, 0, 0, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     -0.5,
  //     0,

  //     // two
  //     0.5,
  //     -0.5,
  //     0,

  //     // three
  //     0.5,
  //     0.5,
  //     0
  //   ],
  //   color: [0, 255, 0, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // // back
  // {
  //   data: [
  //     // one
  //     0.5,
  //     -0.5,
  //     -1,

  //     // two
  //     -0.5,
  //     0.5,
  //     -1,

  //     // three
  //     0.5,
  //     0.5,
  //     -1
  //   ],
  //   color: [0, 255, 0, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // {
  //   data: [
  //     // one
  //     0.5,
  //     -0.5,
  //     -1,

  //     // two
  //     -0.5,
  //     -0.5,
  //     -1,

  //     // three
  //     -0.5,
  //     0.5,
  //     -1
  //   ],
  //   color: [255, 0, 0, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // // top
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     0.5,
  //     0,

  //     //two
  //     0.5,
  //     0.5,
  //     -1,

  //     // three
  //     -0.5,
  //     0.5,
  //     -1
  //   ],
  //   color: [255, 0, 255, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     0.5,
  //     0,

  //     //two
  //     0.5,
  //     0.5,
  //     0,

  //     // three
  //     0.5,
  //     0.5,
  //     -1
  //   ],
  //   color: [255, 255, 255, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // // bottom
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     -0.5,
  //     -1,

  //     //two
  //     0.5,
  //     -0.5,
  //     0,

  //     // three
  //     -0.5,
  //     -0.5,
  //     0
  //   ],
  //   color: [255, 255, 255, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     -0.5,
  //     -1,

  //     //two
  //     0.5,
  //     -0.5,
  //     -1,

  //     // three
  //     0.5,
  //     -0.5,
  //     0
  //   ],
  //   color: [255, 0, 255, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // // left
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     -0.5,
  //     -1,

  //     //two
  //     -0.5,
  //     0.5,
  //     0,

  //     // three
  //     -0.5,
  //     0.5,
  //     -1
  //   ],
  //   color: [255, 255, 0, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // {
  //   data: [
  //     // one
  //     -0.5,
  //     -0.5,
  //     -1,

  //     //two
  //     -0.5,
  //     -0.5,
  //     0,

  //     // three
  //     -0.5,
  //     0.5,
  //     0
  //   ],
  //   color: [0, 0, 255, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // // right
  // {
  //   data: [
  //     // one
  //     0.5,
  //     -0.5,
  //     0,

  //     //two
  //     0.5,
  //     0.5,
  //     -1,

  //     // three
  //     0.5,
  //     0.5,
  //     0
  //   ],
  //   color: [0, 0, 255, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },
  // {
  //   data: [
  //     // one
  //     0.5,
  //     -0.5,
  //     0,

  //     //two
  //     0.5,
  //     -0.5,
  //     -1,

  //     // three
  //     0.5,
  //     0.5,
  //     -1
  //   ],
  //   color: [255, 255, 0, 1],
  //   translation: [0, 0, 0],
  //   rotation: [0, 0, 0],
  //   scale: [1, 1, 1]
  // },

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

    basic.init({buffer, vao});

    // Tell it to use our program (pair of shaders)
    gl.useProgram(basic.program);
  
    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
  
    // if (item.render)
    // item.render({ gl, buffer, vao, gTranslate, gRotate, gScale, camera, player });
    
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(item.data),
      gl.STATIC_DRAW
    );
    gl.uniform4f(basic.attributes.u_color, ...item.color);
    gl.uniformMatrix4fv(
      basic.attributes.u_model,
      false,
      item.getMatrix({ gTranslate, gRotate, gScale })
    );
    gl.uniformMatrix4fv(
      basic.attributes.u_view,
      false,
      player.getCamera()
    );
    gl.uniformMatrix4fv(
      basic.attributes.u_projection,
      false,
      camera.getMatrix()
    );

    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, item.data.length / basic.size);
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
