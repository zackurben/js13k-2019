import BasicShader from './Basic';
import LightedShader from './Lighted';

export default gl => {
  const Basic = BasicShader(gl);
  const Lighted = LightedShader(gl);

  return {
    Basic,
    Lighted
  };
};
