'use strict';

export default (faces, vertices, normal) => {
  function fn(a, b, f) {
    if (a == undefined) {
      a = b;
    }

    return Math[f](a, b);
  }

  function minimize(a, b) {
    return fn(a, b, 'min');
  }

  function maximize(a, b) {
    return fn(a, b, 'max');
  }

  let data = [];
  let normals = [];

  // store min/max for position
  let min = [];
  let max = [];

  faces.map((face, i) => {
    const [a, b, c, d] = face;
    const verts = [
      vertices[a],
      vertices[b],
      vertices[c],
      vertices[a],
      vertices[c],
      vertices[d]
    ];

    verts.forEach(v => {
      // x
      min[0] = minimize(min[0], v[0]);
      max[0] = maximize(max[0], v[0]);

      // y
      min[1] = minimize(min[1], v[1]);
      max[1] = maximize(max[1], v[1]);

      // z
      min[2] = minimize(min[2], v[2]);
      max[2] = maximize(max[2], v[2]);
    });

    data.push(verts.flat());

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
    normals,
    translation: [
      parseFloat(min[0] - max[0]),
      parseFloat(min[1] - max[1]),
      parseFloat(min[2] - max[2])
    ]
  };
};
