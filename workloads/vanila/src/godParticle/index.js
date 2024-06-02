import * as THREE from "three";
import { createAnimationContext } from "@packages/animation/src/context";

const clock = new THREE.Clock();

function render() {
  // things to implement.
}
function animation(context) {
  console.log(context.env.mouse2d);
}

const contextHandler = createAnimationContext(animation, {
  listeners: {
    mousemove: (e) => {
      // console.log("hi", e);
    },
  },
});

contextHandler.setup();
contextHandler.exec();
contextHandler.dispose();
