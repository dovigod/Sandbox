import * as THREE from "three";
import fragment from "./fragment.glsl";
import vertex from "./vertex.glsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

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
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.loader = new THREE.TextureLoader();

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

  async addObjects() {
    let that = this;

    this.texture1 = await new Promise((resolve) => {
      this.loader.load("/clown.jpeg", (data) => {
        resolve(data);
      });
    });

    this.texture2 = await new Promise((resolve) => {
      this.loader.load("/cry.jpg", (data) => {
        resolve(data);
      });
    });

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives: enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: {
          type: "f",
          value: 0,
        },
        resolution: {
          type: "v4",
          value: new THREE.Vector4(),
        },
        uTexture1: {
          value: this.texture1,
        },
        uTexture2: {
          value: this.texture2,
        },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);

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
    if (!this.texture1 && !this.texture2) {
      return;
    }
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

const sketch = new Sketch({
  dom: document.getElementById("container"),
});

// setTimeout(() => {
//   sketch.render();
// }, 1000);

const canvas = document.createElement("canvas");

canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;
canvas.style.position = "fixed";
canvas.style.top = "0px";
canvas.style.left = "0px";

document.body.append(canvas);

const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "/clown.jpeg";

img.addEventListener("load", () => {
  ctx.drawImage(img, 50, 50);
});

//kernel  =

//operation = identity , ridge detection , sharpen , box blur , gaussian blur

const kernel = {
  identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  "ridge-detection": [-1, -1, -1, -1, 4, -1, -1, -1, -1],
  sharpen: [-1, -1, -1, -1, 8, -1, -1, -1, -1],

  blur: {
    box: {
      strength: 9,
      arr: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    gaussian3: {
      strength: 9,
      arr: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    },
    gauusian5: {
      strength: 256,
      arr: [1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1],
    },
    unsharpMasking5: {
      strength: -256,
      arr: [1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, -476, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1],
    },
  },
};

// 커널을 이미지의 모든 픽셀에 적용시키는 과정을 convolution이라 말한다.

// 일반적인 이미지 컨벌루션의 경우 2차원 커널을 사용했다

// 하지만 컴퓨터 그래픽스에선 가우시안 블러를 할땐 seperable convolution을한다

// 특정 픽셀을 부드럽게 하다 : 주변 픽셀과의 편차를 줄이는 것 = 평균내기

// 중심에서 가로 n개 세로 n개를 평균낸다.
