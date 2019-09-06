import BasicShader from './Basic';
import MultiColoredShader from './MultiColored';
import LineShader from './Line';

export default gl => {
  const Basic = BasicShader(gl);
  const MultiColored = MultiColoredShader(gl);
  const Line = LineShader(gl);

  return {
    Basic,
    MultiColored,
    Line
  };
};
