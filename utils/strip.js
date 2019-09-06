'use strict';

const fs = require('fs');
const path = require('path');
const parseMaterials = require('./parseMaterials');

/**
 * Parse obj files and strip them for content that we support.
 */
const model = 'cube';
const data = fs.readFileSync(path.resolve(__dirname, `../models/${model}.obj`));

let materials;
let objs = [];
let vertices = [];
let current;

data
  .toString()
  .split('\n')
  .forEach(ln => {
    if (ln.startsWith('mtllib')) {
      materials = parseMaterials(ln.split('mtllib ').pop());
    }
    if (ln.startsWith('usemtl')) {
      current.color = materials[ln.split('usemtl ').pop()];
    }
    if (ln.startsWith('o ')) {
      // push the last current obj to the output
      if (current) {
        objs.push(current);
      }

      // Create a new object
      current = {
        type: '',
        faces: []
      };

      switch (
        ln
          .split('o ')
          .pop()
          .toString()
          .toLowerCase()
          .split('.')
          .shift()
      ) {
        case 'cube':
          current.type = 'Cube';
          break;
        case 'plane':
          current.type = 'Plane';
          break;
      }
    }

    if (ln.startsWith('v ')) {
      const [x, y, z] = ln
        .split('v ')
        .pop()
        .toString()
        .split(' ')
        .map(parseFloat);
      vertices.push([x, y, z]);
    }

    // parse the faces into vertex/vertex normal pairs
    if (ln.startsWith('f ')) {
      const faces = ln
        .split('f ')
        .pop()
        .toString()
        .split(' ')
        .map(f => {
          const [v] = f.toString().split('//');
          // Zero index all the vertices.
          return parseInt(v) - 1;
        });

      current.faces.push(faces);
    }
  });

// Finish pushing the last parsed obj.
if (current) {
  objs.push(current);
}

fs.writeFileSync(
  path.resolve(__dirname, '../data/data.json'),
  JSON.stringify(
    {
      objs,
      vertices
    },
    undefined,
    2
  )
);
