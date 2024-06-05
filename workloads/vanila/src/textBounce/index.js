import * as THREE from "three";
import { createAnimationContext } from "@packages/animation/src/context";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import img from "./smile.png";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

const _bgColor = "#343434";
const _cameraConfig = {
  area: [10, window.innerWidth / window.innerHeight, , 4000, 4000],
  // area: [45, 1, 10, 3000],
  position: [0, 0, 400],
};
const bgColor = new THREE.Color(_bgColor);
const BallRadius = 3;
const damping = 0.01;
const mass = 1;
const loader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster(new THREE.Vector3(0, -100, 0));
const pointer = new THREE.Vector2(-100, -100);

const fontLoader = new FontLoader();
// const texture = loader.load("./wilson.png");
// console.log(texture);

async function initStage(context) {
  const canvas = document.createElement("canvas");
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.id = "stage";

  const { vpWidth, vpHeight } = context.env.dimension;

  const scene = new THREE.Scene();

  const texture = await new Promise((resolve) => {
    loader.load(img, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      resolve(texture);
    });
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

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
  camera.updateProjectionMatrix();

  // meshes
  const textGeometry = new TextGeometry("W", {
    font,
    size: 14,
  });

  console.log(textGeometry);

  const textMaterial = new THREE.MeshBasicMaterial({ color: "pink" });

  const text = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(text);

  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: "silver",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotateX(-Math.PI / 2);
  plane.position.set(0, -10, 0);
  scene.add(plane);
  const sphereGeo = new THREE.SphereGeometry(BallRadius, 32, 32);

  sphereGeo.clearGroups();
  sphereGeo.addGroup(0, Infinity, 0);
  sphereGeo.addGroup(0, Infinity, 1);

  const sphereMateraialColor = new THREE.MeshBasicMaterial({
    color: "red",
  });
  const sphereMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const sphere = new THREE.Mesh(sphereGeo, [sphereMateraialColor, sphereMaterial]);
  const sphere1 = new THREE.Mesh(sphereGeo, [sphereMateraialColor, sphereMaterial]);
  const sphere2 = new THREE.Mesh(sphereGeo, [sphereMateraialColor, sphereMaterial]);
  const sphere3 = new THREE.Mesh(sphereGeo, [sphereMateraialColor, sphereMaterial]);
  const sphere4 = new THREE.Mesh(sphereGeo, [sphereMateraialColor, sphereMaterial]);

  sphere.name = "ball";
  sphere1.name = "ball";
  sphere2.name = "ball";
  sphere3.name = "ball";
  sphere4.name = "ball";

  sphere.position.set(0, 0, 0);
  sphere1.position.set(-1, 30, 0);
  sphere2.position.set(10, 20, 0);
  sphere3.position.set(30, 40, 0);
  sphere4.position.set(10, 20, 0);

  const wallGeometry = new THREE.PlaneGeometry(100, 100);
  const wallMat = new THREE.MeshBasicMaterial({
    color: "green",
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });

  const wallFrontPosition = [0, 0, BallRadius];
  const wallBackPosition = [0, 0, -BallRadius - 100];

  const wallFront = new THREE.Mesh(wallGeometry, wallMat);
  const wallBack = new THREE.Mesh(wallGeometry, wallMat);
  wallFront.rotation.set(Math.PI, 0, 0);
  wallFront.position.set(...wallFrontPosition);
  wallBack.rotation.set(-Math.PI, 0, 0);
  wallBack.position.set(...wallBackPosition);

  scene.add(wallFront);
  scene.add(wallBack);
  scene.add(sphere);
  scene.add(sphere1);
  scene.add(sphere2);
  scene.add(sphere3);
  scene.add(sphere4);

  // physics
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9, 5),
    quatNormalizeFast: true,
  });
  const groundMaterial = new CANNON.Material("ground");
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ type: CANNON.Body.STATIC, material: groundMaterial });

  const wallMaterial = new CANNON.Material();
  const wallFrontBody = new CANNON.Body({ mass: 0, material: groundMaterial });
  const wallBackBody = new CANNON.Body({ mass: 0, material: groundMaterial });

  wallFrontBody.addShape(groundShape);
  wallFrontBody.position.set(...wallFrontPosition);
  wallFrontBody.quaternion.setFromEuler(Math.PI, 0, 0);

  wallBackBody.addShape(groundShape);
  wallBackBody.position.set(...wallBackPosition);
  wallBackBody.quaternion.setFromEuler(-Math.PI, 0, 0);

  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  groundBody.position.set(0, -10, 0);

  world.addBody(groundBody);
  // world.addBody(wallBackBody);
  world.addBody(wallFrontBody);

  const sphereShape = new CANNON.Sphere(BallRadius);
  const spherePhysicsMaterial = new CANNON.Material();
  const sphereBody = new CANNON.Body({
    mass,
    shape: sphereShape,
    material: spherePhysicsMaterial,
    position: new CANNON.Vec3(0, 0, 0),
  });
  const sphereBody1 = new CANNON.Body({
    mass,
    shape: sphereShape,
    material: spherePhysicsMaterial,
    position: new CANNON.Vec3(-1, 30, 0),
  });
  const sphereBody2 = new CANNON.Body({
    mass,
    shape: sphereShape,
    material: spherePhysicsMaterial,
    position: new CANNON.Vec3(1, 20, 0),
  });
  const sphereBody3 = new CANNON.Body({
    mass,
    shape: sphereShape,
    material: spherePhysicsMaterial,
    position: new CANNON.Vec3(3, 40, 0),
  });
  const sphereBody4 = new CANNON.Body({
    mass,
    shape: sphereShape,
    material: spherePhysicsMaterial,
    position: new CANNON.Vec3(10, 20, 0),
  });
  sphereBody.linearDamping = damping;
  world.addBody(sphereBody);
  world.addBody(sphereBody1);
  world.addBody(sphereBody2);
  world.addBody(sphereBody3);
  world.addBody(sphereBody4);

  const spherer_ground = new CANNON.ContactMaterial(groundMaterial, spherePhysicsMaterial, {
    friction: 0.3,
    restitution: 0.7,
  });
  const spherer_wall = new CANNON.ContactMaterial(wallMaterial, spherePhysicsMaterial, {
    friction: 0.3,
    restitution: 0.7,
  });
  const spherer_sphere = new CANNON.ContactMaterial(spherePhysicsMaterial, spherePhysicsMaterial, {
    friction: 0.3,
    restitution: 0.3,
  });

  world.addContactMaterial(spherer_ground);
  world.addContactMaterial(spherer_sphere);
  world.addContactMaterial(spherer_wall);
  //helper

  const helper = new THREE.AxesHelper(100);
  helper.position.set(0, 0, 0);
  helper.setColors("red", "green", "pink");
  scene.add(helper);
  //controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.noPan = true;
  controls.update();

  sphere.cannon = sphereBody;
  sphere1.cannon = sphereBody1;
  sphere2.cannon = sphereBody2;
  sphere3.cannon = sphereBody3;
  sphere4.cannon = sphereBody4;

  function onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onClick(event) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let i = 0; i < intersects.length; i++) {
      const { object } = intersects[i];

      if (!object.isMesh) {
        continue;
      }

      if (object.name === "ball") {
        object.cannon.applyImpulse(new CANNON.Vec3(0, 20, 0));
        return;
      }
    }
  }
  window.addEventListener("click", onClick);
  window.addEventListener("pointermove", onPointerMove);

  context.attach({
    camera,
    renderer,
    scene,
    controls,
    spheres: [sphere, sphere1, sphere2, sphere3, sphere4],

    world,
    wallBackBody,
    wallBack,
    wallFront,
    wallFrontBody,
  });
}

const timeStep = 1 / 60;

function animation(context) {
  const {
    world,
    env: { clock },
    spheres,
    wallFront,
    wallBack,
    wallFrontBody,
    wallBackBody,
  } = context;

  const delta = clock.getDelta();

  world.step(timeStep);
  for (let i = 0; i < spheres.length; i++) {
    spheres[i].position.copy(spheres[i].cannon.position);

    spheres[i].quaternion.copy(spheres[i].cannon.quaternion);
  }

  wallFront.position.copy(wallFrontBody.position);
  wallBack.position.copy(wallBackBody.position);

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
