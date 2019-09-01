import BasicShader from './Basic';
import MultiColoredShader from './MultiColored';

export default gl => {
  const Basic = BasicShader(gl);
  const MultiColored = MultiColoredShader(gl);

  return {
    Basic,
    MultiColored
  };
};
