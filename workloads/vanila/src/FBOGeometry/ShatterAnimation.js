import { Mesh, DoubleSide, Matrix4, MathUtils, BufferAttribute, Vector3 } from "three";
import gsap from "gsap";

const VERTEX_ITEM_SIZE = 3;
const FACE_ITEM_SIZE = 3;
const ANIMATION_ATTR_SIZE = 2;
const CONTROL_ATTR_SIZE = 3;
const DESTINATION_ATTR_SIZE = 3;

export class ShatterAnimation {
  #id = Symbol("shatter-animation-id");
  static activeSession = new WeakMap();
  constructor(scene, geometry, material, config = {}) {
    const self = this;
    this.scene = scene;
    this.config = populateConfig(config);
    this.geometry = geometry;
    this.material = material;
    this.mesh = null;
    this.duration = this.config.maxDelayY + this.config.maxDelayX + this.config.maxDuration - 3; // need remove of magic numb
    this.animationDuration = this.config.animationDuration;
    this.progress = new Proxy(
      { value: 0 },
      {
        set: (obj, key, value) => {
          obj[key] = value;
          if (key === "value") {
            self._updateUniform("uTime", this.duration * value);
          }
          return true;
        },

        get: (obj, key) => {
          return obj[key];
        },
      },
    );

    this.tl = gsap.timeline({ repeat: -1, yoyo: true });
    this._init();
    ShatterAnimation.activeSession.set(this, false);
  }

  _init() {
    const geometry = this.geometry;
    const material = this.material;
    const zimbal = { x: 0.5, y: 0.5, z: 0.0 };
    const {
      maxDelayX,
      maxDelayY,
      maxDuration,
      minDuration,
      stretch,
      cp0X,
      cp0Y,
      cp0Z,
      cp1X,
      cp1Y,
      cp1Z,
      spreadX,
      spreadY,
      spreadZ,
    } = this.config;

    //set object dimension to center of i
    geometry.computeBoundingBox();
    geometry.userData = {};
    geometry.userData.size = {
      width: geometry.boundingBox.max.x - geometry.boundingBox.min.x,
      height: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
      depth: geometry.boundingBox.max.z - geometry.boundingBox.min.z,
    };

    const zimbalX = geometry.userData.size.width * -zimbal.x;
    const zimbalY = geometry.userData.size.height * -zimbal.y;
    const zimbalZ = geometry.userData.size.depth * -zimbal.z;
    const matrix = new Matrix4().makeTranslation(zimbalX, zimbalY, zimbalZ);

    geometry.baseGeometry.applyMatrix4(matrix);

    // fullfill default attribute values
    const centroids = geometry.getAttribute("centroid");

    let startingVertexIdx = 0;
    let faceIdx = 0;
    let animationIdx = 0;
    const verticesCnt = geometry.faceCnt * 3;
    const aAnimation = new Array(verticesCnt * 2).fill(0);
    const aCp0 = new Array(verticesCnt * 3).fill(0);
    const aCp1 = new Array(verticesCnt * 3).fill(0);
    const aDestination = new Array(verticesCnt * 3).fill(0);

    // iterate base per face
    while (faceIdx < geometry.faceCnt) {
      const cx = centroids[faceIdx * FACE_ITEM_SIZE + 0];
      const cy = centroids[faceIdx * FACE_ITEM_SIZE + 1];
      const cz = centroids[faceIdx * FACE_ITEM_SIZE + 2];

      const centroid = new Vector3(cx, cy, cz);
      const dimension = geometry.userData.size;

      const delayX = Math.abs((centroid.x / dimension.width) * maxDelayX);

      // will splash up if not inverse
      const delayY = Math.abs(centroid.y / dimension.height) * maxDelayY;
      const duration = MathUtils.randFloat(minDuration, maxDuration);

      for (let j = 0; j < VERTEX_ITEM_SIZE * ANIMATION_ATTR_SIZE; j += ANIMATION_ATTR_SIZE) {
        const delayIdx = animationIdx;
        const durationIdx = animationIdx;

        // for texture for tearing material, add stretch value.
        // per force, larger mass results low velocity. to make this obvious ,increase delay to let larger mass(higher stretch) looks much slower
        aAnimation[delayIdx + j + 0] = delayX + delayY + Math.random() * stretch;
        aAnimation[durationIdx + j + 1] = duration;
      }

      const c0x = centroid.x + MathUtils.randFloat(...cp0X);
      const c0y = centroid.y + dimension.height * MathUtils.randFloat(...cp0Y);
      const c0z = MathUtils.randFloatSpread(cp0Z);

      // each control point has symmetric relationship with line connecting start-end point
      // briefly set symmertry line to x-coord
      const c1x = centroid.x + MathUtils.randFloat(...cp1X) * -1;
      const c1y = centroid.y + dimension.height * MathUtils.randFloat(...cp1Y);
      const c1z = MathUtils.randFloatSpread(cp1Z);

      for (let j = 0; j < VERTEX_ITEM_SIZE * CONTROL_ATTR_SIZE; j += CONTROL_ATTR_SIZE) {
        // to spread bidirectionally.
        if (faceIdx % 2 === 0) {
          aCp0[startingVertexIdx + j + 0] = c0x;
          aCp0[startingVertexIdx + j + 1] = c0y;
          aCp0[startingVertexIdx + j + 2] = c0z;

          aCp1[startingVertexIdx + j + 0] = c1x;
          aCp1[startingVertexIdx + j + 1] = c1y;
          aCp1[startingVertexIdx + j + 2] = c1z;
        } else {
          aCp0[startingVertexIdx + j + 0] = c1x;
          aCp0[startingVertexIdx + j + 1] = c1y;
          aCp0[startingVertexIdx + j + 2] = c1z;

          aCp1[startingVertexIdx + j + 0] = c0x;
          aCp1[startingVertexIdx + j + 1] = c0y;
          aCp1[startingVertexIdx + j + 2] = c0z;
        }
      }

      // destinations for each vertices
      const desX = centroid.x + MathUtils.randFloatSpread(spreadX);
      const desY = centroid.y + dimension.height * MathUtils.randFloatSpread(spreadY);
      const desZ = MathUtils.randFloatSpread(spreadZ);

      for (let j = 0; j < VERTEX_ITEM_SIZE * DESTINATION_ATTR_SIZE; j += DESTINATION_ATTR_SIZE) {
        aDestination[startingVertexIdx + j + 0] = desX;
        aDestination[startingVertexIdx + j + 1] = desY;
        aDestination[startingVertexIdx + j + 2] = desZ;
      }

      faceIdx++;
      animationIdx += VERTEX_ITEM_SIZE * ANIMATION_ATTR_SIZE;
      startingVertexIdx += VERTEX_ITEM_SIZE * FACE_ITEM_SIZE;
    }
    geometry.setAttribute("aCentroid", centroids.clone());
    geometry.setAttribute("aAnimation", new BufferAttribute(new Float32Array(aAnimation), ANIMATION_ATTR_SIZE));
    geometry.setAttribute("aCp0", new BufferAttribute(new Float32Array(aCp0), CONTROL_ATTR_SIZE));
    geometry.setAttribute("aCp1", new BufferAttribute(new Float32Array(aCp1), CONTROL_ATTR_SIZE));
    geometry.setAttribute("aDestination", new BufferAttribute(new Float32Array(aDestination), DESTINATION_ATTR_SIZE));

    // material setup
    material.flatShading = true;
    material.transparent = true;
    material.side = DoubleSide;

    Object.assign(material.uniforms, { uTime: { value: 0 } });
    this.mesh = new Mesh(geometry, this.material);
  }

  start() {
    ShatterAnimation.activeSession.set(this, true);
    this.tl.to(this.progress, { value: 1.0, duration: this.animationDuration });
  }

  pause() {
    ShatterAnimation.activeSession.set(this, false);
    this.tl.pause();
  }

  resume() {
    ShatterAnimation.activeSession.set(this, true);
    this.tl.resume();
  }
  restart() {
    ShatterAnimation.activeSession.set(this, true);
    this.tl.restart();
  }

  dispose() {
    ShatterAnimation.activeSession.delete(this);

    this.geometry.baseGeometry.dispose();
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
    this.geometry = null;
    this.material = null;
    this.mesh = null;
  }

  updateConfig() {
    this._init();
  }
  exhaustivlyUpdateMesh(geometry, material) {
    this.dispose();
    this.geometry = geometry;
    this.material = material;
    this.mesh = new Mesh(geometry, material);
    this._init();
    this.scene.add(this.mesh);
  }
  _updateUniform(key, value) {
    // console.log(value);
    this.material.uniforms[key].value = value;
  }
}

function populateConfig(config) {
  const res = {};
  res.maxDelayY = config.maxDelayY || 0.3;
  res.maxDelayX = config.maxDelayX || 3;
  res.minDuration = config.minDuration || 1;
  res.maxDuration = config.maxDuration || 10;
  res.stretch = config.stretch || 0.2;
  res.animationDuration = config.animationDuration || 3;
  res.spreadX = config.spreadX || 240;
  res.spreadY = config.spreadY || 40;
  res.spreadZ = config.spreadZ || 40;
  res.cp0X = config.cp0X || [40, 120];
  res.cp0Y = config.cp0Y || [0, 12];
  res.cp0Z = config.cp0Z || 120;
  res.cp1X = config.cp1X || [80, 120];
  res.cp1Y = config.cp1Y || [0, 12];
  res.cp1Z = config.cp1Z || 120;
  return res;
}
