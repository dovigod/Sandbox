import * as THREE from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import getMaterial from "./getMaterial";
import { texture } from "three/tsl";

function range(min, max) {
  return Math.random() * (max - min) + min;
}
export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGPURenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(0, 0, 7);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.videoTexture = new THREE.VideoTexture(document.getElementById("video"));
    this.videoTexture.colorSpace = THREE.SRGBColorSpace;

    this.time = 0;
    this.isPlaying = true;
    this.bufferedScene();
    this.addObjects();
    this.addLights(this.scene);
    this.resize();
    this.setupResize();
    this.settings();
  }

  bufferedScene() {
    this.scene2 = new THREE.Scene();
    this.camera2 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    this.camera2.position.set(0, 0, 4);

    this.renderTarget = new THREE.RenderTarget(this.width, this.height);

    //video

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2, 2, 2),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: this.videoTexture,
      }),
    );

    this.scene2.add(plane);
    //

    // let num = 50;
    // this.cubes = [];
    // for (let i = 0; i < num; i++) {
    //   let size = range(0.2, 0.9);
    //   let mesh = new THREE.Mesh(
    //     new THREE.BoxGeometry(size, size, size),
    //     new THREE.MeshPhysicalMaterial({ color: 0xffffff }),
    //   );
    //   this.cubes.push(mesh);
    //   mesh.position.set(range(-2, 2), range(-2, 2), range(-2, 2));
    //   mesh.rotation.set(range(0, Math.PI), range(0, Math.PI), range(0, Math.PI));
    //   this.scene2.add(mesh);
    // }

    // this.addLights(this.scene2);
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

  createASCIITexture() {
    const chars = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
    this.length = chars.length;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = this.length * 64;
    canvas.height = 64;
    canvas.className = "remove-styles";

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Menlo"; // since height of each square is 64
    ctx.textAlign = "center";
    ctx.textBaseline = "center";
    // ctx.fillText(chars, canvas.width / 2, canvas.height / 2);

    for (let i = 0; i < this.length; i++) {
      // bloooming~
      if (i > 50) {
        for (let j = 0; j < 10; j++) {
          ctx.filter = `blur(${j * 0.7}px)`;
          ctx.fillText(chars[i], 32 + i * 64, 46);
        }
      }

      ctx.filter = "none";
      ctx.fillText(chars[i], 32 + i * 64, 46); // center render point
    }

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    // document.body.appendChild(canvas);
    return texture;
  }
  addObjects() {
    this.material = getMaterial({
      asciiTexture: this.createASCIITexture(),
      length: this.length,
      scene: this.renderTarget.texture,
    });

    //instanced plane (grid)

    let rows = 50;
    let columns = Math.floor(rows / this.camera.aspect); //50;
    let instances = rows * columns;
    let size = 0.1; // size of each char

    this.geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    this.positions = new Float32Array(instances * 3);
    this.colors = new Float32Array(instances * 3);

    //ascill grid
    this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, instances);
    const uv = new Float32Array(instances * 2);
    const randomness = new Float32Array(instances);
    let index = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        let index = i * columns + j;

        uv[index * 2] = i / (rows - 1);
        uv[index * 2 + 1] = j / (columns - 1);

        randomness[index] = Math.random();
        // to make it center
        this.positions[index * 3] = i * size - (size * (rows - 1)) / 2;
        this.positions[index * 3 + 1] = j * size - (size * (columns - 1)) / 2;
        this.positions[index * 3 + 2] = 0;

        const m = new THREE.Matrix4();
        m.setPosition(this.positions[index * 3], this.positions[index * 3 + 1], this.positions[index * 3 + 2]);
        // this.instancedMesh.setMatrixAt(index, m); // s2
        index++;
      }
    }
    // this.instancedMesh.instanceMatrix.needsUpdate = true; //s2
    //as world position
    this.geometry.setAttribute("aPosition", new THREE.InstancedBufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aPixelUv", new THREE.InstancedBufferAttribute(uv, 2));
    this.geometry.setAttribute("aRandom", new THREE.InstancedBufferAttribute(randomness, 1));

    this.scene.add(this.instancedMesh);
  }

  addLights(scene) {
    const light1 = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
    light2.position.set(1, 1, 0.8666); // ~60
    scene.add(light2);
  }

  render() {
    if (!this.isPlaying) {
      return;
    }
    this.time += 0.01;
    requestAnimationFrame(this.render.bind(this));

    // this.cubes.forEach((cube, i) => {
    //   cube.rotation.x = Math.sin(this.time * cube.position.x);
    //   cube.rotation.y = Math.sin(this.time * cube.position.y);
    //   cube.rotation.z = Math.sin(this.time * cube.position.z);

    //   cube.position.y = Math.sin(this.time + i);
    // });

    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.renderAsync(this.scene2, this.camera2);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

(async function () {
  const video = document.createElement("video");
  // video.style.display = "none";
  video.id = "video";
  document.body.appendChild(video);
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = { video: { width: window.innerWidth, height: window.innerHeight, facingMode: "user" } };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        // apply the stream to the video element used in the texture
        video.srcObject = stream;
        video.play();
      })
      .catch(function (error) {
        console.error("Unable to access the camera/webcam.", error);
      });
  } else {
    console.error("MediaDevices interface not available.");
  }

  const sketch = new Sketch({
    dom: document.getElementById("container"),
  });

  await sketch.renderer.init();

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  sketch.render();
})();

// world position

// implement instance position by my self
