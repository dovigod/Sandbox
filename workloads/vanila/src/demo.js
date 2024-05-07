import { Animator } from "@packages/animation";

const animator = new Animator();

animator.register(() => {});

animator.animate();

setTimeout(() => {
  animator.stop();
}, 4000);
