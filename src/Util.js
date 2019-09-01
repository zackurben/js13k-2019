export function arrayAdd(a, b) {
  let len = Math.max(a.length, b.length);
  let _a, _b;
  return new Array(len).fill(0).map((val, index) => {
    _a = a.length < len ? 0 : a[index];
    _b = b.length < len ? 0 : b[index];
    return _a + _b;
  });
}

export function radToDeg(r) {
  return (r * 180) / Math.PI;
}

export function degToRad(d) {
  return (d * Math.PI) / 180;
}
