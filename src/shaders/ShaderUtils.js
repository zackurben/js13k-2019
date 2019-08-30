'use strict';

export default gl => {
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

  function getAttributes(program, names) {
    let out = {};

    names.forEach(name => {
      if (name.startsWith('a_')) {
        out[name] = gl.getAttribLocation(program, name);
      } else if (name.startsWith('u_')) {
        out[name] = gl.getUniformLocation(program, name);
      }
    });

    console.log(out)
    return out;
  }

  return {
    createShader,
    createProgram,
    getAttributes
  };
};
