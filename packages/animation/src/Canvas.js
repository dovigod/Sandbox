let debounceTimer = null;

export class Canvas {
  #dom;
  #parent;
  #ready = false;
  #ctx;
  #events = new Map();
  #memCache;

  constructor(id) {
    if (typeof id !== "string") {
      throw new Error("Expected string for id");
    }
    this.id = id;
    this.#dom = document.getElementById(id);
    if (!this.#dom) {
      this.#dom = document.createElement("canvas");
      this.#dom.id = id;
      document.body.appendChild(this.#dom);
    }
    this.#dom.style.width = "100%";
    this.#dom.style.height = "100%";

    this.#ctx = this.#dom.getContext("2d");
    this.#parent = this.#dom.parentElement;
    const memCache = document.createElement("canvas");
    this.#memCache = {
      dom: memCache,
      ctx: memCache.getContext("2d"),
    };
    this.resize();
  }

  resize() {
    // for retina
    this.size = {
      width: this.#parent.clientWidth * 2,
      height: this.#parent.clientHeight * 2,
    };
    // // this.#memCache.dom.width = this.size.width;
    // // this.#memCache.dom.height = this.size.height;
    // // this.#memCache.ctx.drawImage(this.#dom, 0, 0);
    this.#dom.width = this.size.width;
    this.#dom.height = this.size.height;
    // this.#ctx.drawImage(this.#memCache.dom, 0, 0);
    this.#ctx.scale(2, 2);
    this.#ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  initialize() {
    if (!this.#ready) {
      const resizeEvent = () => {
        if (debounceTimer) {
          return;
        }
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
        }, 0);
        this.resize.bind(this)();
      };
      this.#events.set("resize", resizeEvent);
      window.addEventListener("resize", this.#events.get("resize"));
    }
    this.#ready = true;
  }

  destroy() {
    this.#ready = false;
    const resizeEvent = this.#events.get("resize");
    window.removeEventListener("resize", resizeEvent);
    this.#events.delete("resize");
  }

  get context() {
    return this.#ctx;
  }
}
