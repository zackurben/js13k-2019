export function radToDeg(r) {
  return (r * 180) / Math.PI;
}

export function degToRad(d) {
  return (d * Math.PI) / 180;
}

export function radToDisplayDeg(r) {
  return parseFloat(parseFloat(radToDeg(r) % 360).toFixed(0));
}
