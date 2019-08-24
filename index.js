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

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length !== 0) {
    return [v[0] / length, v[1] / length, v[2] / length];
  }
  
  return [0, 0, 0];
}

var m4 = {
  inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
             (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
             (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
             (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
             (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
           (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
           (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
           (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
           (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
           (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
           (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
           (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
           (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
           (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
           (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
           (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
           (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];
  },

  identity: function() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0
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
  },

  generateCube({color: [30/255, 40/255, 40/255, 1], translation: [-6, 0, -10], rotation: [0, 0, 0], animate: (data, timestamp) => {
    data.rotation = [0, timestamp/1000, 0];
  }})
].map(item => {
  item.color = item.color || [Math.random(), Math.random(), Math.random(), 1];
  item.translation = item.translation || [0, 0, 0];
  item.rotation = item.rotation || [0, 0, 0];
  item.scale = item.scale || [1, 1, 1];

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
    if (item.animate) {
      item.animate(item, timestamp);
    }
    const { data, color, getMatrix, animation} = item;

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

function generateCube({color, translation, rotation, scale, animate}) {
  return {
    data: [
      // front
      -0.5,
      -0.5,
      0,
      0.5,
      0.5,
      0,
      -0.5,
      0.5,
      0,
      -0.5,
      -0.5,
      0,
      0.5,
      -0.5,
      0,
      0.5,
      0.5,
      0,

      // back
      0.5,
      -0.5,
      -1,
      -0.5,
      0.5,
      -1,
      0.5,
      0.5,
      -1,
      0.5,
      -0.5,
      -1,
      -0.5,
      -0.5,
      -1,
      -0.5,
      0.5,
      -1,

      // top
      -0.5,
      0.5,
      0,
      0.5,
      0.5,
      -1,
      -0.5,
      0.5,
      -1,
      -0.5,
      0.5,
      0,
      0.5,
      0.5,
      0,
      0.5,
      0.5,
      -1,

      // bottom
      -0.5,
      -0.5,
      -1,
      0.5,
      -0.5,
      0,
      -0.5,
      -0.5,
      0,
      -0.5,
      -0.5,
      -1,
      0.5,
      -0.5,
      -1,
      0.5,
      -0.5,
      0,

      // left
      -0.5,
      -0.5,
      -1,
      -0.5,
      0.5,
      0,
      -0.5,
      0.5,
      -1,
      -0.5,
      -0.5,
      -1,
      -0.5,
      -0.5,
      0,
      -0.5,
      0.5,
      0,

      // right
      0.5,
      -0.5,
      0,
      0.5,
      0.5,
      -1,
      0.5,
      0.5,
      0,
      0.5,
      -0.5,
      0,
      0.5,
      -0.5,
      -1,
      0.5,
      0.5,
      -1
    ],
    color,
    translation,
    rotation,
    scale,
    animate
  };
}
