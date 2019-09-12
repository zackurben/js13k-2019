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
