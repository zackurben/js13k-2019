'use strict';

import ShaderUtils from './ShaderUtils';

const vs = `#version 300 es
in vec4 a_position;
in vec4 a_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec4 v_color;

void main() {
  gl_Position = u_projection * inverse(u_view) * u_model * a_position;
  v_color = a_color;
}
`;

const fs = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

export default gl => {
  const { createShader, createProgram, getAttributes } = ShaderUtils(gl);

  const program = createProgram(
    createShader(gl.VERTEX_SHADER, vs),
    createShader(gl.FRAGMENT_SHADER, fs)
  );
  const attributes = getAttributes(program, [
    'a_position',
    'a_color',
    'u_model',
    'u_view',
    'u_projection'
  ]);

  const size = 3; // 3 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer

  return {
    program,
    attributes,
    multicolored: true,
    init(obj) {
      const vao = gl.createVertexArray();
      const vbo = gl.createBuffer();
      const vbo_color = gl.createBuffer();

      // Bind our VAO
      gl.bindVertexArray(vao);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(obj.data),
        gl.STATIC_DRAW
      );

      // Specify memory layout
      gl.vertexAttribPointer(
        attributes.a_position,
        size,
        type,
        normalize,
        stride,
        offset
      );

      // Enable our shader attributes
      gl.enableVertexAttribArray(attributes.a_position);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(obj.color),
        gl.STATIC_DRAW
      );

      // Specify the memory layout
      gl.vertexAttribPointer(
        attributes.a_color,
        4,
        type,
        normalize,
        stride,
        offset
      );

      // Enable the shader color attribute
      gl.enableVertexAttribArray(attributes.a_color);

      return {
        vao,
        vbo,
        vbo_color
      };
    },
    render(obj, { camera }) {
      // Render
      gl.useProgram(program);

      // Use our pre configured VAO
      gl.bindVertexArray(obj.vao);

      gl.uniformMatrix4fv(attributes.u_model, false, obj.worldMatrix);
      gl.uniformMatrix4fv(attributes.u_view, false, camera.getMatrix());
      gl.uniformMatrix4fv(
        attributes.u_projection,
        false,
        camera.getProjectionMatrix()
      );

      gl.drawArrays(gl.TRIANGLES, offset, obj.data.length / size);
    }
  };
};
