import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GUI } from "lil-gui";
//renderer
export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1, 100);
    this.camera.position.set(4, 5, 4);

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);
    //

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.update();
    this.controls = controls;

    this.time = 0;
    this.isPlaying = true;
    this.setup();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  setup() {
    this.addCubeFace(
      new THREE.ConeGeometry(0.25, 0.5, 4),
      "red",
      1,
      new THREE.Vector3(0, 0, 0.5),
      new THREE.Vector3(0, 0, 0),
    );
    this.addCubeFace(
      new THREE.CylinderGeometry(0.15, 0.15, 0.5),
      "yellow",
      2,
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(-Math.PI / 2, 0, 0),
    );
    this.addCubeFace(
      new THREE.OctahedronGeometry(0.25),
      "green",
      3,
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(Math.PI / 2, 0, 0),
    );
    this.addCubeFace(
      new THREE.TorusGeometry(0.25, 0.1),
      "blue",
      4,
      new THREE.Vector3(0, 0, -0.5),
      new THREE.Vector3(Math.PI, 0, 0),
    );
    this.addCubeFace(
      new THREE.ConeGeometry(0.25, 0.5),
      "orange",
      5,
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(0, -Math.PI / 2, 0),
    );
    this.addCubeFace(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      "brown",
      6,
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(0, Math.PI / 2, 0),
    );

    const boxBorderMat = new THREE.MeshPhongMaterial({ color: 0x1a120b });
    boxBorderMat.stencilWrite = true;
    boxBorderMat.stencilRef = 0;
    boxBorderMat.stencilFunc = THREE.EqualStencilFunc;
    const boxBorderGeom = new THREE.BoxGeometry();
    this.scene.add(new THREE.Mesh(boxBorderGeom, boxBorderMat));
  }
  addCubeFace(objectGeom, objectColor, stencilRef, planePos, planeRot) {
    // CUBE FACE
    // for use of stencil
    const planeGeom = new THREE.PlaneGeometry();
    const stencilMat = new THREE.MeshPhongMaterial({ color: "white" });
    stencilMat.depthWrite = false; // will not affect depth buffer so that behind material could be seen
    stencilMat.stencilWrite = true; // means material will do stencil check, and able to write in to stencil buffer

    // stencilRef=  number used for stencil check and write into stencil buffer
    stencilMat.stencilRef = stencilRef;

    // always succeed stencil.
    stencilMat.stencilFunc = THREE.AlwaysStencilFunc;

    //write the defined stencil reference number into the stencil buffer
    // when stencil check and depth check pass, replace stencil buffer value to defined stencil value
    stencilMat.stencilZPass = THREE.ReplaceStencilOp;
    const stencilMesh = new THREE.Mesh(planeGeom, stencilMat);
    stencilMesh.position.copy(planePos);
    stencilMesh.rotation.x = planeRot.x;
    stencilMesh.rotation.y = planeRot.y;
    stencilMesh.rotation.z = planeRot.z;
    stencilMesh.scale.multiplyScalar(0.9);
    this.scene.add(stencilMesh);

    // OBJECT INSIDE CUBE
    const objectMat = new THREE.MeshPhongMaterial({ color: objectColor });
    //by this, affected by stencil buffer
    objectMat.stencilWrite = true;
    objectMat.stencilRef = stencilRef;
    // stencil check will pass only if stencil buffer value = stencil ref
    objectMat.stencilFunc = THREE.EqualStencilFunc;
    const object = new THREE.Mesh(objectGeom, objectMat);
    this.scene.add(object);
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }
  stop() {
    this.isPlaying = false;
  }
  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) {
      return;
    }
    const renderer = this.renderer;

    this.controls.update();
    renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

const sketch = new Sketch({
  dom: document.getElementById("container"),
});

sketch.render();
