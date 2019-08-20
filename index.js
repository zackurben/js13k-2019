const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('no gl context');
}

const vSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

// all shaders have a main function
void main() {

 // gl_Position is a special variable a vertex shader
 // is responsible for setting
 gl_Position = a_position;
}
`;

const fSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
 // Just set the output to a constant redish-purple
 outColor = vec4(1, 0, 0.5, 1);
}
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// MAIN

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


const colorLocation = gl.getUniformLocation(program, "u_color");

// three 2d points
const positions = [
  // one
  0,
  0,
  1,

  //two
  0,
  0.5,
  1,

  // three
  0.7,
  0,
  1,

  // second item
  // one
  -0.9,
  -0.9,
  0,

  //two
  -0.7,
  -0.1,
  0,

  // three
  -0.2,
  -0.8,
  0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);

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

// resize(gl.canvas);
// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// // Clear the canvas
// gl.clearColor(0, 0, 0, 1);
// gl.clear(gl.COLOR_BUFFER_BIT);

// Tell it to use our program (pair of shaders)
gl.useProgram(program);

// Bind the attribute/buffer set we want.
gl.bindVertexArray(vao);

let lastRender = 0;
let now;
let delta;
render();

function render(timestamp = 0) {
  now = Date.now();
  delta = timestamp - lastRender;
  
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);

  lastRender = now;
  return requestAnimationFrame(render);
}

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
