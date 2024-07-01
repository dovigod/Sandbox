import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import simVertex from "./simVertex.glsl";
import simFragment from "./simFragment.glsl";
import vertexParticle from "./vertexParticle.glsl";
import fragmentParticle from "./fragmentParticle.glsl";

const pointer = {
  x: 0,
  y: 0,
};
const scene = new THREE.Scene();
const container = document.querySelector("body");
const raycaster = new THREE.Raycaster();

let width = container.offsetWidth;
let height = container.offsetHeight;
const renderer = new THREE.WebGLRenderer({});

renderer.setSize(width, height);
renderer.setClearColor(0x000000, 1);
// renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setPixelRatio = Math.min(2, window.devicePixelRatio);
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
camera.position.set(0, 0, 2);

// const camera = new THREE.PerspectiveCamera(75, width, height);
// camera.position.set(0.5, 0.5, 3);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// scene.add(camera);

let fbo;
let fbo1;
let fboScene;
let fboCamera;
let fboMesh;
let points;
let material;
let fboMaterial;
let size;
let data;
let count;
let fboTexture;
let info;
let infoarray;

function resize() {
  width = container.offsetWidth;
  height = container.offsetHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function run() {
  setupFBO();
  addObject();
  setMouseEvent();
  resize();
  // renderer.render(scene, camera);
  render();
}

const clock = new THREE.Clock();

function render() {
  const time = clock.getElapsedTime();

  controls.update();
  material.uniforms.time.value = time;
  fboMaterial.uniforms.time.value = time;
  requestAnimationFrame(render);

  fboMaterial.uniforms.uPositions.value = fbo1.textures[0];
  material.uniforms.uPositions.value = fbo.textures[0];

  fboMaterial.uniforms.time.value;

  // do the calculations
  renderer.setRenderTarget(fbo);
  renderer.render(fboScene, fboCamera);
  // to null
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  // swap render targets;
  let temp = fbo;
  fbo = fbo1;
  fbo1 = temp;
}

run();

function getRenderTarget() {
  // linear vs nearest
  // linear will render gradients but nearest will render pixelized.
  // format : to get 4 values r g b a
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
  });

  return renderTarget;
}

function setupFBO() {
  fbo = getRenderTarget();
  fbo1 = getRenderTarget();
  size = 256;

  fboScene = new THREE.Scene();
  fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  fboCamera.position.set(0, 0, 0.5);
  fboCamera.lookAt(0, 0, 0);
  // view port is 2 by 2 so geometry could fill whole viewport
  const fboGeometry = new THREE.PlaneGeometry(2, 2);

  data = new Float32Array(size * size * 4);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = (i + j * size) * 4;
      const theta = Math.random() * Math.PI * 2;
      const r = 0.5 + 0.5 * Math.random();

      data[index + 0] = r * Math.cos(theta);
      data[index + 1] = r * Math.sin(theta);
      data[index + 2] = 1;
      data[index + 3] = 1;
    }
  }

  fboTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  fboTexture.magFilter = THREE.NearestFilter;
  fboTexture.minFilter = THREE.NearestFilter;
  fboTexture.needsUpdate = true;

  fboMaterial = new THREE.ShaderMaterial({
    extensions: {
      derivatives: "#extension GL_OES_standard_derivatives : enable",
    },
    side: THREE.DoubleSide,
    uniforms: {
      uPositions: { value: fboTexture },
      uInfo: { value: null },
      uMouse: { value: new THREE.Vector2(0, 0) },
      time: {
        value: 0,
      },
      reolution: { value: new THREE.Vector4() },
    },
    vertexShader: simVertex,
    fragmentShader: simFragment,
  });

  infoarray = new Float32Array(size * size * 4);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = (i + j * size) * 4;

      infoarray[index + 0] = 0.4 + Math.random();
      infoarray[index + 1] = 0.4 + Math.random();
      infoarray[index + 2] = 1;
      infoarray[index + 3] = 1;
    }
  }

  info = new THREE.DataTexture(infoarray, size, size, THREE.RGBAFormat, THREE.FloatType);
  info.magFilter = THREE.NearestFilter;
  info.minFilter = THREE.NearestFilter;
  info.needsUpdate = true;

  fboMaterial.uniforms.uInfo.value = info;
  fboMesh = new THREE.Mesh(fboGeometry, fboMaterial);
  fboScene.add(fboMesh);

  renderer.setRenderTarget(fbo);
  renderer.render(fboScene, fboCamera);
  renderer.setRenderTarget(fbo1);
  renderer.render(fboScene, fboCamera);
}

function addObject() {
  material = new THREE.ShaderMaterial({
    extensions: {
      derivatives: "#extension GL_OES_standard_derivatives : enable",
    },
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uPositions: { value: null },
      uMouse: { value: new THREE.Vector2(0, 0) },
      time: {
        value: 0,
      },
      reolution: { value: new THREE.Vector4() },
    },
    vertexShader: vertexParticle,
    fragmentShader: fragmentParticle,
  });

  // number of pixel
  count = size ** 2;

  //need to calculate uv for points
  // add objects
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i + j * size;
      positions[index * 3 + 0] = Math.random();
      positions[index * 3 + 1] = Math.random();
      positions[index * 3 + 2] = 0;
      uv[index * 2 + 0] = i / size;
      uv[index * 2 + 1] = j / size;
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

  // to make donut shape
  material.uniforms.uPositions.value = fboTexture;

  points = new THREE.Points(geometry, material);
  scene.add(points);
  //
}

window.addEventListener("resize", resize);

/*
vertex : default vertex is not for particle...
*/

function setMouseEvent() {
  document.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    let intersects = raycaster.intersectObject(dummy);

    if (intersects.length > 0) {
      let [x, y] = intersects[0].uv;
      fboMaterial.uniforms.uMouse.value = new THREE.Vector2(x, y);
    }
  });
}
