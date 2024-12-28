// homunclus.jp/about
import * as THREE from "three";
import fragment from "./fragment.glsl";
import vertex from "./vertex.glsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gltf from "../../public/head.glb";
import pipe1Vert from "./postprocess/pipe1.glsl";
import pipe1Frag from "./postprocess/pipe1frage.glsl";

// 그림자
// 세모
// 복셀
// 와따리가따리

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.initialized = false;
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // after effect

    this.sourceRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
    this.renderTarget1 = new THREE.WebGLRenderTarget(this.width, this.height);
    this.renderTarget2 = new THREE.WebGLRenderTarget(this.width, this.height);

    this.dracoLoader = new DRACOLoader(new THREE.LoadingManager()).setDecoderPath(
      "three/examples/jsx/libs/draco/gltf/",
    );
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.gltfLoader.load(gltf, (gltf) => {
      this.settings();
      this.setupPostProccess();
      this.addObjects();
      this.resize();
      this.setupResize();
      // "sunglasses"
      // Sphere001

      console.log(gltf);
      this.model = gltf.scene.getObjectByName("Sphere");
      // this.model.geometry.scale(18, 18, 18);

      //convert to non indexes
      // 모델이 이렇게 생겼으니.. 삼격형태로 분리할려면 이리해야함
      this.model.geometry.center();
      this.model.geometry = this.model.geometry.toNonIndexed();

      //calculate center of each triangle
      const pos = this.model.geometry.attributes.position.array;
      const centers = [];

      for (let i = 0; i < pos.length; i += 9) {
        const x = (pos[i + 0] + pos[i + 3] + pos[i + 6]) / 3;
        const y = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3;
        const z = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3;

        // 3 vertices should have same center
        centers.push(x, y, z);
        centers.push(x, y, z);
        centers.push(x, y, z);
      }
      this.model.geometry.setAttribute("center", new THREE.BufferAttribute(new Float32Array(centers), 3));
      this.scene.add(this.model);
      this.model.material = this.material;
      this.initialized = true;
    });

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(0, -10, 30);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;
    this.isPlaying = true;
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
      triScale: 1,
      diffusion: 0.2,
      translate: 0,
      mosaic: 1.18,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.0001).onChange((val) => {
      this.postQuad.material.uniforms.progress.value = val;
      this.material.uniforms.progress.value = val;
    });
    this.gui.add(this.settings, "triScale", 0, 1, 0.01).onChange((val) => {
      this.material.uniforms.triScale.value = val;
    });
    this.gui.add(this.settings, "diffusion", 0, 1, 0.01).onChange((val) => {
      this.postQuad.material.uniforms.diffusion.value = val;
    });
    this.gui.add(this.settings, "translate", 0, 1, 0.01).onChange((val) => {
      this.postQuad.material.uniforms.translate.value = val;
    });
    this.gui.add(this.settings, "mosaic", 0, 15, 0.01).onChange((val) => {
      this.material.uniforms.mosaic.value = val;
    });
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
    let that = this;
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
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
        triScale: {
          value: this.settings.triScale,
        },
        diffusion: {
          value: this.settings.diffusion,
        },
        mosaic: {
          value: this.settings.mosaic,
        },
        progress: {
          value: this.settings.progress,
        },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    console.dir(this.geometry);
    this.plane = new THREE.Mesh(this.geometry, this.material);

    // this.scene.add(this.plane);
  }

  setupPostProccess() {
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.orthoCamera.position.z = 1;
    this.orthoScene = new THREE.Scene();

    this.postQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: {
          current: {
            value: null,
          },
          prev: {
            value: new THREE.Vector4(0, 0, 0, 0),
          },
          diffusion: {
            value: this.settings.diffusion,
          },
          time: {
            value: 0,
          },
          translate: {
            value: 0,
          },
          progress: {
            value: this.settings.progress,
          },
          mosaic: {
            value: this.settings.mosaic,
          },
        },
        vertexShader: pipe1Vert,
        fragmentShader: pipe1Frag,
      }),
    );

    this.orthoScene.add(this.postQuad);

    this.finalScene = new THREE.Scene();
    this.finalQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: null,
      }),
    );
    this.finalScene.add(this.finalQuad);
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
    requestAnimationFrame(this.render.bind(this));
    if (!this.isPlaying) {
      return;
    }
    if (!this.initialized) {
      return;
    }
    this.time += 0.05;
    if (this.model) {
      // this.model.position.x = 0.2 * Math.sin(this.time * 0.3);
    }
    this.material.uniforms.time.value = this.time;

    this.renderer.setRenderTarget(this.sourceRenderTarget);
    this.renderer.render(this.scene, this.camera);

    // store 2 textures
    this.postQuad.material.uniforms.current.value = this.sourceRenderTarget.texture;
    this.postQuad.material.uniforms.prev.value = this.renderTarget1.texture;
    this.postQuad.material.uniforms.time.value = this.time;

    this.renderer.setRenderTarget(this.renderTarget2);
    this.renderer.render(this.orthoScene, this.orthoCamera);

    this.finalQuad.material.map = this.renderTarget1.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.finalScene, this.orthoCamera);

    let temp = this.renderTarget1;
    this.renderTarget1 = this.renderTarget2;
    this.renderTarget2 = temp;
  }
}

const sketch = new Sketch({
  dom: document.getElementById("container"),
});

sketch.render();
