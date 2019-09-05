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
      ${mat.slice(0, 4).map(trim).join(', ')}
      ${mat.slice(4, 8).map(trim).join(', ')}
      ${mat.slice(8, 12).map(trim).join(', ')}
      ${mat.slice(12, 16).map(trim).join(', ')}
  `;
}
