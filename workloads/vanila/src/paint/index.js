import * as THREE from "three";
import fragmentFBO from "./fragmentFBO.glsl";
import vertexFBO from "./vertexFBO.glsl";
import fragmentLerp from "./fragmentLerp.glsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { TrailCanvas } from "./TrailCanvas";

const log = (msg) => console.log(`%c ${msg}`, "color: red; background-color:Aquamarine;");
const debug = (msg) => console.log(`%c ${msg}`, "color: black; background-color: yellow");

export default class Stage {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.timer = new THREE.Clock();
    this.frame = 0;
    this.time = 0;

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setClearColor(0xeeeeee, 1);

    // this.renderer.setClearColor(0x222222, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerPos = new THREE.Vector3();

    this.whiteScene = new THREE.Scene();
    this.whiteBg = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.whiteScene.add(this.whiteBg);
    this.whiteBg.position.z = -1;

    // setInterval(() => {
    //   console.log("fps::", this.frame);
    //   this.frame = 0;
    // }, 1000);

    this.box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    // this.whiteScene.add(this.box);
    this.whiteTarget = new THREE.WebGLRenderTarget(this.width, this.height);

    this.trailCanvas = new TrailCanvas({
      // interpolate: 2,
      // smoothing: 0,
      // maxAge: 6000,
      // intensity: 0.3,
      // radius: 0.08,
      width: 512,
      height: 512 * (document.body.offsetHeight / document.body.offsetWidth), // tmp maybe for aspect ratio,
      smoothing: 0.4,
      maxAge: 50,
      smoothing: 0,
      radius: 0.06,
      interpolate: 2,
      minForce: 0.6,
      intensity: 1,
      blend: "screen",
      ease: (x) => {
        return 1 - Math.pow(1 - x, 3);
      },
    });
    this.lineConfig = {
      // fadeSpeed: 0.14,
      // lineStrength: 0.5,
      // bleedSpeed: 0.3,
      // bleedThreshold: 0.5,
      // displacement: 0.5,
      // displacement: 4,
      // noiseFrequency: 15,
      // noiseOctaves: 3,
      // saturation: 0.95,
      // luminosity: 0.8,
      // bleedBlur: 0.3,
      // lineBlur: 0.5,
      // delta: 0.1,
      fadeSpeed: 0.62,
      lineStrength: 1,
      bleedSpeed: 0.3,
      bleedThreshold: 1.6,
      saturation: 0.7,
      luminosity: 0.48,
      displacement: 0.5,
      bleedBlur: 0,
      lineBlur: 0,
      delta: 0.1,
    };

    this.setupPipeline();
    this.settings();
    this.resize();
    this.mouseEvents();
    this.render();
    this.setupResize();
    log("----- ---- Ready ---- ----- ");
  }

  setupPipeline() {
    this.sourceTarget = new THREE.WebGLRenderTarget(this.width, this.height);
    this.targetA = new THREE.WebGLRenderTarget(this.width, this.height);
    this.targetB = new THREE.WebGLRenderTarget(this.width, this.height);

    this.renderer.setRenderTarget(this.whiteTarget);
    this.renderer.render(this.whiteScene, this.camera);

    this.fboScene = new THREE.Scene();
    this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fboMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {
          value: this.time,
        },
        uDiffuse: {
          value: null,
        },
        uPrev: {
          value: this.whiteTarget.texture, /// previous texture
        },
        uResolution: {
          value: new THREE.Vector4(this.width, this.height, 1, 1),
        },
        uColor: {
          value: new THREE.Vector4(),
        },
        uFrame: {
          value: this.frame,
        },
        uTrailer: {
          value: this.trailCanvas.texture,
        },
        uLineBlur: {
          value: this.lineConfig.lineBlur,
        },
        uBleedBlur: {
          value: this.lineConfig.bleedBlur,
        },
        uSaturation: {
          value: this.lineConfig.saturation,
        },
        uLuminosity: {
          value: this.lineConfig.luminosity,
        },
        uBleedSpeed: {
          value: this.lineConfig.bleedSpeed,
        },
        uBleedThreshold: {
          value: this.lineConfig.bleedThreshold,
        },
        uLineStrength: {
          value: this.lineConfig.lineStrength,
        },
        uFadeSpeed: {
          value: this.lineConfig.fadeSpeed,
        },
        uDisplacement: {
          value: this.lineConfig.displacement,
        },
        uDelta: {
          value: this.lineConfig.delta,
        },
      },
      vertexShader: vertexFBO,
      fragmentShader: fragmentFBO,
    });

    this.fboQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fboMaterial);
    this.fboScene.add(this.fboQuad);

    //final : only for rendering somthing. just to output some texture

    this.finalScene = new THREE.Scene();
    this.finalQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        map: this.targetA.texture,
      }),
    );

    this.finalScene.add(this.finalQuad);
  }
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  settings() {
    const gui = new GUI({ width: 200 });
    this.gui = gui;

    gui.add(this.lineConfig, "saturation", 0, 1, 0.01);
    gui.add(this.lineConfig, "luminosity", 0, 1, 0.01);
    gui.add(this.lineConfig, "bleedThreshold", 0, 100, 0.01);
    gui.add(this.lineConfig, "bleedSpeed", -1, 1, 0.0001);
    gui.add(this.lineConfig, "bleedBlur", -10, 10, 0.01);
    gui.add(this.lineConfig, "lineStrength", 0, 1, 0.01);
    gui.add(this.lineConfig, "fadeSpeed", -3, 1, 0.01);
    gui.add(this.lineConfig, "lineBlur", 0, 1, 0.01);
    gui.add(this.lineConfig, "displacement", 0, 10, 0.01);
    gui.add(this.lineConfig, "delta", 0, 1, 0.0001);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  mouseEvents() {
    this.raycastPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
    );

    this.dummy = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 30, 30),
      new THREE.MeshBasicMaterial({
        color: 0xffffffff,
        // map: new THREE.TextureLoader().load(particle),
        transparent: true,
      }),
    );
    this.scene.add(this.dummy);
    window.addEventListener("mousemove", (e) => {
      this.pointer.x = (e.clientX / this.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.height) * 2 + 1;

      this.trailCanvas.addTouch(this.pointer);

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects([this.raycastPlane]);
      if (intersects.length > 0) {
        this.dummy.position.copy(intersects[0].point);
      }
    });
  }

  render() {
    // this.time += 0.05;
    const time = this.timer.getElapsedTime();
    this.time = (time - Math.floor(time)) / 100;
    this.frame = this.frame + 1;
    // this.time = this.timer.getElapsedTime();
    // this.material.uniforms.time.value = this.time;

    // const x = this.render.bind(this);
    // setTimeout(function () {
    //   x();
    // }, 1000 / 60);
    requestAnimationFrame(this.render.bind(this));

    this.trailCanvas.update(this.time);
    // return;

    //rendering the source
    // black background with white ball -> give it to source target (black & white texture)
    this.renderer.setRenderTarget(this.sourceTarget);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    //only for calculation purpose.
    this.renderer.setRenderTarget(this.targetA);
    this.renderer.render(this.fboScene, this.fboCamera);

    // console.dir(this.trailCanvas.texture);

    this.fboMaterial.uniforms.uTime.value = time;
    this.fboMaterial.uniforms.uTrailer.value = this.trailCanvas.texture;
    this.fboMaterial.uniforms.uDiffuse.value = this.sourceTarget.texture;
    this.fboMaterial.uniforms.uPrev.value = this.targetA.texture;
    this.fboMaterial.uniforms.uBleedBlur.value = this.lineConfig.bleedBlur;
    this.fboMaterial.uniforms.uBleedSpeed.value = this.lineConfig.bleedSpeed;
    this.fboMaterial.uniforms.uBleedThreshold.value = this.lineConfig.bleedThreshold;
    this.fboMaterial.uniforms.uSaturation.value = this.lineConfig.saturation;
    this.fboMaterial.uniforms.uLuminosity.value = this.lineConfig.luminosity;
    this.fboMaterial.uniforms.uLineStrength.value = this.lineConfig.lineStrength;
    this.fboMaterial.uniforms.uFadeSpeed.value = this.lineConfig.fadeSpeed;
    this.fboMaterial.uniforms.uLineBlur.value = this.lineConfig.lineBlur;
    this.fboMaterial.uniforms.uDisplacement.value = this.lineConfig.displacement;
    this.fboMaterial.uniforms.uDelta.value = this.timer.getDelta() * 90;

    // console.log(this.fboMaterial.uniforms.uDelta.value);
    // console.log(this.timer.getDelta());
    /// 0.015  ~ 0.155
    //final render
    this.finalQuad.material.map = this.targetA.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.finalScene, this.fboCamera);

    let temp = this.targetA;
    this.targetA = this.targetB;
    this.targetB = temp;
  }
}

const stage = new Stage({
  dom: document.getElementById("container"),
});

stage.render();
