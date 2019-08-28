import basicVS from './basic.vs';
import basicFS from './basic.fs';
import { radToDeg, degToRad } from '../Util';

export default gl => {
  class Shader {
    constructor(vs, fs, attributes, init = () => {}) {
      this.program = createProgram(
        createShader(gl.VERTEX_SHADER, vs),
        createShader(gl.FRAGMENT_SHADER, fs)
      );

      this.attributes = getAttributes(this.program, attributes);

      if (init) {
        init(this);
      }
    }
  }

  function createShader(type, source) {
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

  function createProgram(vertexShader, fragmentShader) {
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

  function getAttributes(program, names, cb) {
    let out = {};

    names.forEach(name => {
      if (name.startsWith('a_')) {
        out[name] = gl.getAttribLocation(program, name);
      } else if (name.startsWith('u_')) {
        out[name] = gl.getUniformLocation(program, name);
      }
    });

    return out;
  }

  return {
    basic: new Shader(
      basicVS,
      basicFS,
      ['a_position', 'u_color', 'u_model', 'u_view', 'u_projection'],
      self => {
        // Enable our shader attribute
        gl.enableVertexAttribArray(
          gl.getAttribLocation(self.program, 'a_position')
        );

        const size = 3; // 3 components per iteration
        const type = gl.FLOAT; // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(
          gl.getAttribLocation(self.program, 'a_position'),
          size,
          type,
          normalize,
          stride,
          offset
        );

        self.data = {
          size
        };
      }
    )
  };
};
