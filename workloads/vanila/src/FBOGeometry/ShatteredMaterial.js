import { ShaderMaterial, DoubleSide } from "three";
import vert from "./shatteredVert.glsl";
import frag from "./shatteredFrag.glsl";

export class ShatteredMaterial extends ShaderMaterial {
  constructor(param) {
    super(param);

    this.flatShading = true;
    this.transparent = true;
    this.side = DoubleSide;
    this.vertexShader = vert;
    this.fragmentShader = frag;
  }
}
