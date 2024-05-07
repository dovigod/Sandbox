export class Animator {
  #FRAME_SPAN;
  #frameId;
  #state;
  #animationFunc;

  constructor(fps = 60) {
    this.fps = fps > 60 ? 60 : fps;
    this.#FRAME_SPAN = 60 / fps;
    this.#animationFunc = null;
    this.#frameId = null;
    this.#state = "idle";
  }
  register(animationFunc) {
    if (typeof animationFunc === "function") {
      this.#animationFunc = animationFunc;
    } else {
      throw new Error(`Unexpected type ${typeof animationFunc} for animationFunc. Expected to be 'Function'`);
    }
  }

  animate() {
    if (!this.#animationFunc) {
      console.warn("animation function not registered");
      return;
    }
    if (this.#state === "running") {
      console.error("Duplicate execution not allowed");
      return;
    }

    let currentFrame = 0;
    this.#state = "running";

    const execute = () => {
      currentFrame++;

      if (this.#FRAME_SPAN <= currentFrame) {
        this.#animationFunc();
        currentFrame = 0;
      }
      this.#frameId = requestAnimationFrame(execute);
    };

    execute();
  }

  stop() {
    if (this.#frameId) {
      cancelAnimationFrame(this.#frameId);
      this.#frameId = null;
      this.#state = "idle";
    }
  }
}
