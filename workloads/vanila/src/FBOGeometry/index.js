import * as THREE from "three";
import { createAnimationContext } from "@packages/animation/src/context";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { ShatteredBufferGeometry } from "./ShatteredBufferGeometry";
import vert from "./shatteredVert.glsl";
import frag from "./shatteredFrag.glsl";
import { ShatterAnimation } from "./ShatterAnimation";
import { stats } from "../../../../packages/utils";
import * as dat from "lil-gui";

const TEXT = "137.5";
const gui = new dat.GUI();
stats.showPanel(0);
const _bgColor = "#ffffff";
const _cameraConfig = {
  area: [10, window.innerWidth / window.innerHeight, , 4000, 4000],
  position: [50, 0, 900],
};
const fontLoader = new FontLoader();
let fontSize = window.innerWidth / 300;

async function initStage(context) {
  const canvas = document.createElement("canvas");
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.id = "stage";

  const { vpWidth, vpHeight } = context.env.dimension;

  const scene = new THREE.Scene();

  const font = await new Promise((resolve) => {
    fontLoader.load("/droid_sans_bold.typeface.json", (font) => {
      resolve(font);
    });
  });

  //renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });
  renderer.setSize(vpWidth, vpHeight);
  renderer.setClearColor(_bgColor);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  //camera
  const camera = new THREE.PerspectiveCamera(..._cameraConfig.area);
  camera.position.set(..._cameraConfig.position);
  camera.lookAt(0, 0, -10);

  // meshes
  const textGeometry = new TextGeometry(TEXT, {
    font,
    size: fontSize,
  });
  textGeometry.lookAt(camera.position);

  const geometry = new ShatteredBufferGeometry(textGeometry);

  const shaderMaterial = new THREE.ShaderMaterial({
    flatShading: true,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: vert,
    fragmentShader: frag,
  });

  const shatterAnimation = new ShatterAnimation(scene, geometry, shaderMaterial, { animationDuration: 5 });

  scene.add(shatterAnimation.mesh);

  //controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.noPan = true;
  controls.update();

  gui.add(shatterAnimation.progress, "value", 0, 1, 0.01);
  gui.add(shatterAnimation.config, "maxDelayX", 0, 3, 0.1).onFinishChange(() => {
    shatterAnimation.updateConfig();
  });
  gui.add(shatterAnimation.config, "maxDelayY", 0, 3, 0.1).onFinishChange(() => {
    shatterAnimation.updateConfig();
  });
  gui.add(shatterAnimation.config, "maxDuration", 1, 30, 1).onFinishChange(() => {
    shatterAnimation.updateConfig();
  });
  gui.add(shatterAnimation.config, "minDuration", 1, 10, 1).onFinishChange(() => {
    shatterAnimation.updateConfig();
  });
  gui.add(shatterAnimation.config, "stretch", 0, 3, 0.01).onFinishChange(() => {
    shatterAnimation.updateConfig();
  });
  gui.add(shatterAnimation, "animationDuration", 3, 20, 0.5).onFinishChange(() => {
    shatterAnimation.updateConfig();
  });

  const actions = {
    pause: shatterAnimation.pause.bind(shatterAnimation),
    resume: shatterAnimation.resume.bind(shatterAnimation),
    restart: shatterAnimation.restart.bind(shatterAnimation),
  };

  gui.add(actions, "pause");
  gui.add(actions, "resume");
  gui.add(actions, "restart");

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    fontSize = window.innerWidth / 100;
    console.log(fontSize);
    // shiit
    shatterAnimation.exhaustivlyUpdateMesh(
      new ShatteredBufferGeometry(new TextGeometry(TEXT, { size: fontSize, font })),
      shaderMaterial,
    );
  }

  window.addEventListener("resize", resize.bind(this));
  stats.begin();

  shatterAnimation.start();

  context.attach({
    camera,
    renderer,
    scene,
    controls,
    shatterAnimation,
  });
}

function animation(context) {
  const {
    env: { clock },
    shatterAnimation,
  } = context;

  const delta = clock.getDelta();
  stats.update();
  context.controls.update();
  // context.controls.dispose();
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

await contextHandler.setup();
contextHandler.exec();
// contextHandler.dispose();
