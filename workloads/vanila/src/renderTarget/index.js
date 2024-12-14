import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GUI } from "lil-gui";
//renderer
export default class Sketch {
  constructor(options) {
    this.primary = {};
    this.secondary = {};

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

    //

    this.time = 0;
    this.isPlaying = true;
    this.setupPrimary();
    this.setupSecondary();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  setupPrimary() {
    const planeSetting = {
      width: 6,
      height: 7,
      position: {
        x: -5,
        y: 7 / 2,
        z: 5,
      },
      rotation: {
        x: 0,
        y: -Math.PI / 4,
        z: 0,
      },
    };
    const cameraSetting = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 500,
    };
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xa8def0);

    const color = 0xffffff;
    const intensity = 1;
    const dLight = new THREE.DirectionalLight(color, intensity);

    dLight.position.set(3, 10, -4);
    dLight.position.set(-16, 8, 16);
    dLight.castShadow = true;
    dLight.shadow.mapSize.width = 4096;
    dLight.shadow.mapSize.height = 4096;
    const d = 35;

    dLight.shadow.camera.left = -d;
    dLight.shadow.camera.right = d;
    dLight.shadow.camera.top = d;
    dLight.shadow.camera.bottom = -d;

    const ambientLight = new THREE.AmbientLight(color, 1);

    const floorGeometry = new THREE.PlaneGeometry(100, 100, 32);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: "skyblue",
      side: THREE.DoubleSide,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.set(-Math.PI / 2, 0, 0);
    floor.position.set(0, -1, 0);

    const planeGeometry = new THREE.PlaneGeometry(planeSetting.width, planeSetting.height, 32);
    const planeMaterial = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.set(planeSetting.position.x, planeSetting.position.y, planeSetting.position.z);
    plane.rotation.set(planeSetting.rotation.x, planeSetting.rotation.y, planeSetting.rotation.z);
    plane.castShadow = true;
    scene.add(dLight);
    scene.add(ambientLight);
    scene.add(plane);
    scene.add(floor);

    const camera = new THREE.PerspectiveCamera(
      cameraSetting.fov,
      cameraSetting.aspect,
      cameraSetting.near,
      cameraSetting.far,
    );
    camera.position.set(-12, 8, 30);

    const controls = new OrbitControls(camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent camera below ground;
    controls.minPolarAngle = Math.PI / 4; // prevent top down view;
    controls.update();

    const aHelper = new THREE.AxesHelper(100);
    scene.add(aHelper);

    this.primary = {
      scene,
      camera,
      controls,
      actors: {
        plane,
        floor,
      },
      actorSetting: {
        plane: planeSetting,
        camera: cameraSetting,
      },
    };
  }
  setupSecondary() {
    const primaryPlaneSetting = this.primary.actorSetting.plane;
    const primaryCameraSetting = this.primary.actorSetting.camera;

    const buffer = new THREE.WebGLRenderTarget(primaryPlaneSetting.width * 512, primaryPlaneSetting.height * 512);

    const camera = new THREE.PerspectiveCamera(
      primaryCameraSetting.fov,
      buffer.width / buffer.height,
      primaryCameraSetting.near,
      primaryCameraSetting.far,
    );

    camera.position.set(
      primaryPlaneSetting.position.x,
      primaryPlaneSetting.position.y + 4,
      primaryPlaneSetting.position.z,
    );

    camera.lookAt(new THREE.Vector3(10, 5, -10));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd61c4e);

    const dLight = new THREE.DirectionalLight(0xffffff, 1);
    dLight.position.set(-10, 10, 10);
    dLight.castShadow = true;
    dLight.shadow.mapSize.width = 4096;
    dLight.shadow.mapSize.height = 4096;
    const d = 35;

    dLight.shadow.camera.left = -d;
    dLight.shadow.camera.right = d;
    dLight.shadow.camera.top = d;
    dLight.shadow.camera.bottom = -d;

    const floorGeometry = new THREE.PlaneGeometry(100, 100, 32);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: "pink",
      side: THREE.DoubleSide,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.set(-Math.PI / 2, 0, 0);
    floor.position.set(0, -1, 0);

    scene.add(dLight);
    scene.add(floor);

    //the result of this render target should be renderered on plane
    this.primary.actors.plane.material.map = buffer.texture;

    this.secondary = {
      buffer,
      scene,
      camera,
      actors: {
        light: {
          directional: dLight,
        },
        floor,
      },
      actorSetting: {
        plane: {},
      },
    };
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
    this.primary.camera.aspect = this.width / this.height;
    this.primary.camera.updateProjectionMatrix();
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
    const primary = this.primary;
    const secondary = this.secondary;

    secondary.camera.rotation.x = primary.camera.rotation.x;

    secondary.camera.rotation.y = primary.camera.rotation.y;

    secondary.camera.rotation.z = primary.camera.rotation.z;

    //renderer will render to the render target
    renderer.setRenderTarget(secondary.buffer);
    // render secondary scene
    renderer.render(secondary.scene, secondary.camera);
    // renderer render to default frame (canvas)
    renderer.setRenderTarget(null);
    primary.controls.update();

    //renderer render primary scene
    renderer.render(primary.scene, primary.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

const sketch = new Sketch({
  dom: document.getElementById("container"),
});

sketch.render();
