import * as THREE from "three";
import fragment from "./fragment.glsl";
import vertex from "./vertex.glsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import image from "/ripple/punk.jpg";

console.log(image);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);

    this.videoDOM = document.getElementById("video-cover");
    this.videoDOM.play();
    this.video = new THREE.VideoTexture(this.videoDOM);
    this.video.needsUpdate = true;

    const frustumSize = 1;
    this.camera = new THREE.OrthographicCamera(
      frustumSize / -2,
      frustumSize / 2,
      frustumSize / -2,
      frustumSize / 2,
      -1000,
      1000,
    );
    this.camera.position.set(0, 0, 2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.isPlaying = true;
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      scale: 0.2,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "scale", 0, 4, 0.001);
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
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives: enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: {
          value: 0,
        },

        uCircleScale: {
          value: 0.2,
        },
        uImage: {
          value: new THREE.TextureLoader().load(image),
        },
        uVideo: {
          value: this.video,
        },
        uViewport: {
          value: new THREE.Vector2(this.width, this.height),
        },
        uMediaDimension: {
          value: new THREE.Vector2(1980, 1080),
        },
        resolution: {
          value: new THREE.Vector4(),
        },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      // transparent: true,
    });

    console.log;
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.plane.scale.y = -1;

    this.scene.add(this.plane);
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
    this.time += 0.005;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.uCircleScale.value = this.settings.scale;
    requestAnimationFrame(this.render.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const sketch = new Sketch({
  dom: document.getElementById("container"),
});

sketch.render();
