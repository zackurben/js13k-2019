'use strict';

import m4 from '../Matrix';
import ShaderUtils from './ShaderUtils';

const vs = `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_world;

out vec4 v_color;
out vec3 v_normal_location;
out vec3 v_normal;

void main() {
  gl_Position = u_projection * inverse(u_view) * u_model * a_position;
  v_color = a_color;
  v_normal_location = vec3(u_model * a_position);
  v_normal = a_normal;
}
`;

const fs = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

in vec4 v_color;
in vec3 v_normal_location;
in vec3 v_normal;

uniform vec3 u_ambient_light;
uniform vec3 u_light;

out vec4 outColor;

void main() {
  vec3 norm = normalize(v_normal);
  vec3 lightDir = normalize(u_light - v_normal_location);
  float light = dot(norm, lightDir);

  outColor = v_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= u_ambient_light + light;
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
    'a_normal',
    'u_ambient_light',
    'u_light',
    'u_model',
    'u_view',
    'u_projection',
    'u_world'
  ]);

  const size = 3; // 3 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer

  return {
    program,
    attributes,
    init(obj) {
      const vao = gl.createVertexArray();
      const vbo = gl.createBuffer();
      const vbo_color = gl.createBuffer();
      const vbo_normals = gl.createBuffer();

      // Bind our VAO
      gl.bindVertexArray(vao);

      // Enable vertex layout
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

      // Enable fragment colors
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

      // Enable lighting
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo_normals);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(obj.normals),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(
        attributes.a_normal,
        3,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(attributes.a_normal);

      return {
        vao,
        vbo,
        vbo_color,
        vbo_normals
      };
    },
    render(obj, { camera }) {
      // Render
      gl.useProgram(program);

      // Use our pre configured VAO
      gl.bindVertexArray(obj.vao);
      gl.uniform3fv(attributes.u_ambient_light, [0.2, 0.2, 0.2]);
      gl.uniform3fv(attributes.u_light, [0, 2, 0]);
      gl.uniformMatrix4fv(attributes.u_model, false, obj.worldMatrix);
      gl.uniformMatrix4fv(attributes.u_view, false, camera.worldMatrix);
      gl.uniformMatrix4fv(
        attributes.u_projection,
        false,
        camera.getProjectionMatrix()
      );
      gl.uniformMatrix4fv(attributes.u_world, false, obj.worldMatrix);

      gl.drawArrays(gl.TRIANGLES, offset, obj.data.length / size);
    }
  };
};
