import BasicShader from './Basic';
import MultiColoredShader from './MultiColored';
import LightedShader from './Lighted';

export default gl => {
  const Basic = BasicShader(gl);
  const MultiColored = MultiColoredShader(gl);
  const Lighted = LightedShader(gl);

  return {
    Basic,
    MultiColored,
    Lighted
  };
};
