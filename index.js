const CACHE = {
  _count: 20,
  _last: [],
  get() {
    return this._last.reduce((sum, cur) => (sum += cur), 0) / this._count;
  },
  add(item) {
    this._last.unshift(item);
    this._last = this._last.slice(0, this._count);
  }
};
const FPS = Object.create(CACHE);
const DRAW = Object.create(CACHE);

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

var m4 = {
  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
  },

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);
 
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
    ];
  },

  translation: function(tx, ty, tz) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  scaling: function(sx, sy, sz) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  }
};

const vSource = `#version 300 es

in vec4 a_position;

uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * a_position;
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
  }
].map(item => {
  item.getMatrix = () => {
    let matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
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
const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

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

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Render each of our objects
  objs.forEach(item => {
    const { data, color, getMatrix } = item;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.uniform4f(colorLocation, ...color);

    // gScale = [0.5, 0.5, 0.5];
    // gRotate = [timestamp/500, timestamp/500, 0]
    gl.uniformMatrix4fv(matrixLocation, false, getMatrix());

    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, data.length / size);
  });

  if (fps) {
    FPS.add(1000 / delta);
    DRAW.add(delta);

    fps.innerText = `frame ms: ${DRAW.get()}\nfps: ${FPS.get()}`;
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
