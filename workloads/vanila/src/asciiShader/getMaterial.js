import * as THREE from "three/webgpu";
import {
  mx_noise_float,
  color,
  cross,
  dot,
  float,
  transformNormalToView,
  sign,
  step,
  uniform,
  varying,
  vec2,
  vec3,
  vec4,
  Fn,
  uv,
  texture,
  pow,
  attribute,
  mix,
  floor,
  Loop,
  positionLocal,
  atan,
  length as tslLength,
  cos,
  sin,
  atan2,
} from "three/tsl";
import portrait from "/portrait.jpeg";

const synthwavePallet1 = ["#FFD317", "#FF901E", "#FE2975", "#F122FF", "#8C1EFE"];
const synthwavePallet2 = ["#00e78a", "#5060c0", "#bb496c", "#920075", "#2de2e6"];

// length of texture
export default function getMaterial({ asciiTexture, length, scene }) {
  //https://prideout.net/barrel-distortion
  function barrelDistortion(position) {
    const theta = atan2(position.y, position.x);
    let radius = tslLength(position);
    radius = pow(radius, 0.9);
    const pos = vec3(radius.mul(cos(theta)), radius.mul(sin(theta)), 0);
    return pos.add(1).mul(0.5);
  }

  const uTexture = new THREE.TextureLoader().load(portrait);

  // can use shader material, but use node material
  const material = new THREE.NodeMaterial({
    wireframe: true,
  });
  const uColor1 = uniform(color(synthwavePallet1[0]));
  const uColor2 = uniform(color(synthwavePallet1[1]));
  const uColor3 = uniform(color(synthwavePallet1[2]));
  const uColor4 = uniform(color(synthwavePallet1[3]));
  const uColor5 = uniform(color(synthwavePallet1[4]));
  const uColor6 = uniform(color(synthwavePallet2[0]));
  const uColor7 = uniform(color(synthwavePallet2[1]));
  const uColor8 = uniform(color(synthwavePallet2[2]));
  const uColor9 = uniform(color(synthwavePallet2[3]));
  const uColor10 = uniform(color(synthwavePallet2[4]));

  const positionMath = Fn(() => {
    const p = positionLocal;

    /**
     * barrel distortion
     */

    // const pos = barrelDistortion(attribute("aPosition"));
    // const radius = tslLength(attribute("aPosition")).mul(0.05);

    // const pUv = attribute("aPixelUv").mul(0.1); //s2
    // return p.add(pUv.mul(0.3));

    const finalPos = p.add(attribute("aPosition")).mul(-1);
    return finalPos;
    // return p.add(pos);
  });

  // shader code
  const asciiCode = Fn(() => {
    // const textureColor = texture(uTexture, uv());
    const textureColor = texture(scene, attribute("aPixelUv"));
    // return vec4(uv().x, uv().y, 0, 1);

    //https://en.wikipedia.org/wiki/Gamma_correction
    let brightness = pow(textureColor.r, 0.9);
    brightness = brightness.add(attribute("aRandom").mul(0.02));

    //sampling textuer

    //1. need values from 0 ~ 1
    //2. first div -> split grid
    //3. brightness dependency + floor stepping
    const asciiUv = vec2(
      uv()
        .x.div(length)
        .add(floor(brightness.mul(length)).div(length)),
      uv().y,
    );
    const asciiCode = texture(asciiTexture, asciiUv);
    //end

    let finalColor = uColor1;

    finalColor = mix(finalColor, uColor2, step(0.1, brightness));
    finalColor = mix(finalColor, uColor3, step(0.2, brightness));
    finalColor = mix(finalColor, uColor4, step(0.3, brightness));
    finalColor = mix(finalColor, uColor5, step(0.4, brightness));
    finalColor = mix(finalColor, uColor6, step(0.5, brightness));
    finalColor = mix(finalColor, uColor7, step(0.6, brightness));
    finalColor = mix(finalColor, uColor8, step(0.7, brightness));
    finalColor = mix(finalColor, uColor9, step(0.8, brightness));
    finalColor = mix(finalColor, uColor10, step(0.9, brightness));

    return asciiCode.mul(finalColor);
    // return vec4(finalColor, 1);
    // return vec4(attribute("aPixelUv").x, attribute("aPixelUv").y, 0, 1);
  });

  // material.colorNode = vec4(1, 0, 0, 1);
  material.colorNode = asciiCode();
  material.positionNode = positionMath();

  return material;
}
