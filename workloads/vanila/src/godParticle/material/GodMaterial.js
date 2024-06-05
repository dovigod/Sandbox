import { ShaderMaterial } from "three";
import vertexShader from "./gmVert.glsl";
import fragmentShader from "./gmFrag.glsl";

export class MeshGodMaterial {
  constructor(params = {}) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.uniforms = params.uniforms || {};
    this.motionMultiplier = params.motionMultiplier || 1;

    return new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });
  }
}
