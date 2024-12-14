import * as THREE from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGPURenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;
    this.isPlaying = true;
    this.addObjects();
    this.addLights();
    this.resize();
    this.setupResize();
    this.settings();
  }

  settings() {
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

  addObjects() {
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
    });

    //instanced plane (grid)

    let rows = 50;
    let columns = 50;
    let instances = rows * columns;
    let size = 0.1; // size of each char

    this.geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, instances);

    this.scene.add(this.instancedMesh);
  }

  addLights() {
    const light1 = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(0.5, 0, 0.8666);
    this.scene.add(light2);
  }

  render() {
    if (!this.isPlaying) {
      return;
    }
    this.time += 0.05;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

const sketch = new Sketch({
  dom: document.getElementById("container"),
});

(async function () {
  await sketch.renderer.init();

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  console.log("adapter: ", adapter);
  console.log("device: ", device);
  sketch.render();
})();
