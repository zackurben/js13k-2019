import BasicShader from './Basic';
import MultiColoredShader from './MultiColored';
import LineShader from './Line';
import LightedShader from './Lighted';

export default gl => {
  const Basic = BasicShader(gl);
  const MultiColored = MultiColoredShader(gl);
  const Line = LineShader(gl);
  const Lighted = LightedShader(gl);

  return {
    Basic,
    MultiColored,
    Line,
    Lighted
  };
};
