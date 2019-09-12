import m4 from './Matrix';

export function radToDeg(r) {
  return (r * 180) / Math.PI;
}

export function degToRad(d) {
  return (d * Math.PI) / 180;
}

export function radToDisplayDeg(r) {
  return parseFloat(parseFloat(radToDeg(r) % 360).toFixed(0));
}

export function trim(n) {
  return parseFloat(n).toFixed(2);
}

export function displayMat(mat) {
  return `
      ${mat
        .slice(0, 4)
        .map(trim)
        .join(', ')}
      ${mat
        .slice(4, 8)
        .map(trim)
        .join(', ')}
      ${mat
        .slice(8, 12)
        .map(trim)
        .join(', ')}
      ${mat
        .slice(12, 16)
        .map(trim)
        .join(', ')}
  `;
}

export function formatTime(i) {
  i = i.toString();
  return `${i.length === 1 ? `0${i}` : i}`;
}

export function storeScore(score) {
  try {
    localStorage.setItem('score', score);
  }
  catch (e) {
    return score;
  }
}

export function getScore() {
  try {
    return localStorage.getItem('score');
  }
  catch (e) {
    return 0;
  }
}

export function getAllComponents(component) {
  return (component.components || []).concat(
    (component.components || []).map(c => getAllComponents(c)).flat()
  );
}

export function repeat(item, num) {
  let out = [];
  for (let i = 0; i < num; i++) {
    out = out.concat(item);
  }

  return out.flat();
}

export function random(target, cb) {
  let val = Math.random() ? Math.random() : Math.random();
  if (val < target) {
    return cb();
  }
}

export function calculateBB(item) {
  // If the localMatrix has changed, recalculate the bounding box
  if (item._worldMatrix != item.worldMatrix) {
    item._worldMatrix = item.worldMatrix;
    item.boundingbox = item.updateBoundingBox(
      m4.getTranslation(item.worldMatrix)
    );
  }
}

export function el(i) {
  return document.querySelector(i);
}
