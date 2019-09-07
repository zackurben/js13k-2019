'use strict';

export default (faces, vertices, normal) => {
  let data = [];
  let normals = [];

  faces.map((face, i) => {
    const [a, b, c, d] = face;
    data.push(
      [
        vertices[a],
        vertices[b],
        vertices[c],
        vertices[a],
        vertices[c],
        vertices[d]
      ].flat()
    );

    // Give each vertex in this face the same normals.
    normals.push(
      normal[i],
      normal[i],
      normal[i],
      normal[i],
      normal[i],
      normal[i]
    );
  });

  data = data.flat();
  normals = normals.flat();

  return {
    data,
    normals
  };
};
