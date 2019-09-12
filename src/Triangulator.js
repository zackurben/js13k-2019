'use strict';

export default (faces, vertices, normal) => {
  let data = [];
  let normals = [];

  faces.map((face, i) => {
    const [a, b, c, d] = face;
    data.push(vertices[a], vertices[b], vertices[c]);

    // Adjust for missing normals
    if (normal.length <= i) {
      i = normal.length - 1;
    }

    // Give each vertex in this face the same normals.
    normals.push(normal[i], normal[i], normal[i]);

    // If 4 faces are defined, build two triangles.
    if (d !== undefined) {
      data.push(vertices[a], vertices[c], vertices[d]);
      normals.push(normal[i], normal[i], normal[i]);
    }
  });

  data = data.flat();
  normals = normals.flat();

  // Determine our geometry offset
  let translation = data.slice(0, 3);
  translation[0] += 1;
  translation[1] += 1;
  translation[2] -= 1;

  // Modify all the geometry data to center the item.
  let out = [];
  let temp;
  while ((temp = data.splice(0, 3)).length !== 0) {
    out.push([
      temp[0] - translation[0],
      temp[1] - translation[1],
      temp[2] - translation[2]
    ]);
  }
  data = out.flat();

  return {
    data,
    normals,
    translation
  };
};
