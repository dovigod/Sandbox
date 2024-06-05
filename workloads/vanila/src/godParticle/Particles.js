import * as THREE from "three";
import { MeshGodMaterial } from "./material/GodMaterial";

export function createParticles(cnt = 100) {
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

  // const material = new THREE.PointsMaterial({ size: 15, vertexColors: true });

  const material = new MeshGodMaterial();
  const points = new THREE.Points(geometry, material);

  points.pool = new THREE.Object3D();
  points.pool.add(points);
  return points;
}
