'use strict';

export default (faces, vertices) => {
  return faces.map(face => {
    const [a, b, c, d] = face;
    return [
      vertices[a],
      vertices[b],
      vertices[c],
      vertices[a],
      vertices[c],
      vertices[d]
    ]
      .map(([x, y, z]) => [x, y, z])
      .flat();
  });
};
