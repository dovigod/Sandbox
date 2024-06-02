export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  // since each dimension is perfectly independent from each, 'addition' will be intuitivly defined as below as well as other fundamental operations  (3)
  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
  }
}

export function normalize(vec) {
  const s = Math.pow(vec.x, 2) + Math.pow(vec.y, 2);

  if (!s) {
    return new Vector(0, 0);
  }
  const size = Math.sqrt(s);
  return new Vector(vec.x / size, vec.y / size);
}
