'use strict';

const fs = require('fs');
const path = require('path');

module.exports = file => {
  let data = fs.readFileSync(path.resolve(__dirname, `../models/${file}`));
  let materials = [];
  let material;

  data
    .toString()
    .split('\n')
    .forEach(ln => {
      if (ln.startsWith('newmtl')) {
        // Persist the last known material
        if (material) {
          materials.push(material);
        }

        // Create a new material
        material = {
          name: ln.split('newmtl ').pop()
        };
      }
      if (ln.startsWith('Kd ')) {
        material.color = ln
          .split('Kd ')
          .pop()
          .toString()
          .split(' ')
          .map(parseFloat);
      }
    });

  // Persist the last material if we had one.
  if (material) {
    materials.push(material);
  }

  return materials.reduce(
    (acc, cur) => Object.assign(acc, { [cur.name]: cur.color }),
    {}
  );
};
