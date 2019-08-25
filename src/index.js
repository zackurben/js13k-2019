import Input from './Input';
import StatCache from './StatCache';
import m4 from './Matrix';
import Primitive from './Primitive';
import Player from './Player';

const player = new Player();
const FPS = new StatCache();
const DRAW = new StatCache();

const canvas = document.querySelector('canvas');
const fps = document.querySelector('div');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

function radToDeg(r) {
  return (r * 180) / Math.PI;
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

const vSource = `#version 300 es

in vec4 a_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * u_view * u_model * a_position;
}
`;

const fSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fSource);
const program = createProgram(gl, vertexShader, fragmentShader);

//
// MAIN
//

let fieldOfViewRadians = degToRad(60);
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
let zNear = 1;
let zFar = 2000;
let gTranslate = [0, 0, -5];
let gRotate = [1, 1, 1];
let gScale = [1, 1, 1];

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

  Primitive.cube({
    color: [30 / 255, 40 / 255, 40 / 255, 1],
    translation: [-6, 0, -10],
    rotation: [0, 0, 0],
    animate: (data, timestamp) => {
      data.rotation = [0, timestamp / 1000, 0];
    }
  })
].map(item => {
  item.color = item.color || [Math.random(), Math.random(), Math.random(), 1];
  item.translation = item.translation || [0, 0, 0];
  item.rotation = item.rotation || [0, 0, 0];
  item.scale = item.scale || [1, 1, 1];

  item.getMatrix = () => {
    let matrix = m4.identity();
    matrix = m4.translate(matrix, ...item.translation);
    matrix = m4.translate(matrix, ...gTranslate);
    matrix = m4.xRotate(matrix, item.rotation[0]);
    matrix = m4.xRotate(matrix, gRotate[0]);
    matrix = m4.yRotate(matrix, item.rotation[1]);
    matrix = m4.yRotate(matrix, gRotate[1]);
    matrix = m4.zRotate(matrix, item.rotation[2]);
    matrix = m4.zRotate(matrix, gRotate[2]);
    matrix = m4.scale(matrix, ...item.scale);
    matrix = m4.scale(matrix, ...gScale);
    return matrix;
  };

  return item;
});

// Get all our shader attributes
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getUniformLocation(program, 'u_color');
const modelLocation = gl.getUniformLocation(program, 'u_model');
const viewLocation = gl.getUniformLocation(program, 'u_view');
const projectionLocation = gl.getUniformLocation(program, 'u_projection');

// Create our buffer
const positionBuffer = gl.createBuffer();

// Create our VAO for our new buffer
const vao = gl.createVertexArray();

// Bind our VAO
gl.bindVertexArray(vao);

// Enable our shader attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Bind our rendering buffer to the current ARRAY_BUFFER
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const size = 3; // 3 components per iteration
const type = gl.FLOAT; // the data is 32bit floats
const normalize = false; // don't normalize the data
const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
const offset = 0; // start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation,
  size,
  type,
  normalize,
  stride,
  offset
);

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
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Render each of our objects
  objs.forEach(item => {
    if (item.animate) {
      item.animate(item, timestamp);
    }
    const { data, color, getMatrix, animation } = item;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.uniform4f(colorLocation, ...color);
    gl.uniformMatrix4fv(modelLocation, false, getMatrix());
    gl.uniformMatrix4fv(viewLocation, false, player.getCamera());
    gl.uniformMatrix4fv(
      projectionLocation,
      false,
      m4.perspective(fieldOfViewRadians, aspect, zNear, zFar)
    );

    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, data.length / size);
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

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
