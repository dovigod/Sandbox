import * as THREE from "three";

export function createParticleMesh(cnt = 100) {
  // const pool = new THREE.Object3D();
  // const geometry = new THREE.BufferGeometry();

  // const vertices = new Float32Array(3 * cnt).map((v) => THREE.MathUtils.randFloatSpread(2000));

  // geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  // const material = new THREE.MeshBasicMaterial({ color: "#0x888888" });
  // const mesh = new THREE.Points(geometry, material);

  // mesh.castShadow = true;
  // mesh.receiveShadow = true;
  // pool.add(mesh);
  // mesh.pool = pool;
  // mesh.sizeAttenuation = false;

  // return mesh;
  const particles = 50000;

  const geometry = new THREE.BufferGeometry();

  const positions = [];
  const colors = [];

  const color = new THREE.Color();

  const n = 1000,
    n2 = n / 2; // particles spread in the cube

  for (let i = 0; i < particles; i++) {
    // positions

    const x = Math.random() * n - n2;
    const y = Math.random() * n - n2;
    const z = Math.random() * n - n2;

    positions.push(x, y, z);

    // colors

    const vx = x / n + 0.5;
    const vy = y / n + 0.5;
    const vz = z / n + 0.5;

    color.setRGB(vx, vy, vz, THREE.SRGBColorSpace);

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  geometry.computeBoundingSphere();

  //

  const material = new THREE.PointsMaterial({ size: 15, vertexColors: true });

  const points = new THREE.Points(geometry, material);

  points.pool = new THREE.Object3D();
  points.pool.add(points);
  return points;
}
