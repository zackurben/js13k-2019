'use strict';

import ShaderUtils from './ShaderUtils';

const basicVS = `#version 300 es
in vec4 a_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * u_view * u_model * a_position;
}
`;

const basicFS = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

export default gl => {
  const { createShader, createProgram, getAttributes } = ShaderUtils(gl);

  const program = createProgram(
    createShader(gl.VERTEX_SHADER, basicVS),
    createShader(gl.FRAGMENT_SHADER, basicFS)
  );
  const attributes = getAttributes(program, [
    'a_position',
    'u_color',
    'u_model',
    'u_view',
    'u_projection'
  ]);
  
  return {
    program,
    attributes,
    size: 3
  };
};
