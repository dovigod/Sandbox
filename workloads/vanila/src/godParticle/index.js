import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createAnimationContext } from "@packages/animation/src/context";
import { createParticleMesh } from "./Particles";

const _bgColor = "#343434";
const _cameraConfig = {
  position: [300, window.innerWidth / window.innerHeight, , 300, 4000],
  area: [45, 1, 10, 3000],
};
const bgColor = new THREE.Color(_bgColor);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

function initStage(context) {
  const canvas = document.createElement("canvas");
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.id = "stage";

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });
  const { vpWidth, vpHeight } = context.env.dimension;
  renderer.setSize(vpWidth, vpHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(..._cameraConfig.area);
  camera.position.set(..._cameraConfig.position);
  // const camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 3500);
  // camera.position.z = 2750;

  renderer.setClearColor(_bgColor);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.noPan = true;
  controls.update();

  const mesh = createParticleMesh();
  scene.add(mesh.pool);
  // mesh.pool.position.z = 1050;

  context.attach({
    camera,
    renderer,
    scene,
    controls,
  });
}

function animation(context) {
  context.controls.update();
}

const contextHandler = createAnimationContext(animation, {
  listeners: {
    mousemove: (e) => {
      // console.log("hi", e);
    },
  },
  onSetup: initStage,
  simulator: true,
});

contextHandler.setup();
contextHandler.exec();
// contextHandler.dispose();
