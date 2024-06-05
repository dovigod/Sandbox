import { BufferGeometry, BufferAttribute } from "three";

export class ShatteredBufferGeometry extends BufferGeometry {
  constructor(baseGeometry) {
    super();
    this.baseGeometry = baseGeometry;
    this.centroids = this.updateCentroid();
    this.attributes = this.baseGeometry.attributes;
    this.faceCnt = this.getAttribute("position").count / 3;
    this.parameters = this.baseGeometry.parameters;
    this.groups = this.baseGeometry.groups;

    this.updateCentroid();
  }
  updateCentroid() {
    const centroids = [];
    const positions = this.getAttribute("position");

    for (let i = 0; i < this.faceCnt * 3 * 3; i += 9) {
      const f1x = positions.array[i + 0];
      const f1y = positions.array[i + 1];
      const f1z = positions.array[i + 2];

      const f2x = positions.array[i + 3];
      const f2y = positions.array[i + 4];
      const f2z = positions.array[i + 5];

      const f3x = positions.array[i + 6];
      const f3y = positions.array[i + 7];
      const f3z = positions.array[i + 8];

      const cx = (f1x + f2x + f3x) / 3;
      const cy = (f1y + f2y + f3y) / 3;
      const cz = (f1z + f2z + f3z) / 3;

      for (let v = 0; v < 9; v += 3) {
        centroids.push(...[cx, cy, cz]);
      }
    }

    const centroidAttribute = new BufferAttribute(new Float32Array(centroids), 3, false);
    this.setAttribute("centroid", centroidAttribute);
  }
  computeBoundingBox() {
    this.baseGeometry.computeBoundingBox();
    this.boundingBox = this.baseGeometry.boundingBox;
    this.boundingSphere = this.baseGeometry.boundingSphere;
  }
  applyMatrix4(matrix) {
    this.baseGeometry.applyMatrix4(matrix);
    this.updateCentroid();
  }

  addVertexbBasedAttribute(name, size) {
    const position = this.getAttribute("position");
    const buffer = new Float32Array(position.length * size);
    const attribute = new BufferAttribute(buffer, size);
    this.setAttribute(name, attribute);
    return attribute;
  }
}
