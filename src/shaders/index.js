import BasicShader from './Basic';
import MultiColoredShader from './MultiColored';

export default (gl, args) => {
  const Basic = BasicShader(gl, args);
  const MultiColored = MultiColoredShader(gl, args);

  return {
    Basic,
    MultiColored
  };
};
