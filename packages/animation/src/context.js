import * as THREE from "three";
import { stats } from "@packages/utils";

export function createAnimationContext(animation, config = { simulator: false }) {
  const context = {
    id: Symbol("context-id"),
    stats: config.simulator,
    state: false,
    env: {
      mouse2d: new THREE.Vector2(0, 0),
      mouse3d: new THREE.Ray(),
      clock: new THREE.Clock(),
      dimension: {
        vpWidth: window.innerWidth,
        vpHeight: window.innerHeight,
      },
    },
    attach: (record) => {
      Object.assign(context, record);
    },
  };
  let _clearListeners = null;
  let _frameId = null;
  const task = animation.bind(null, context);

  const _setup = async () => {
    if ("onSetup" in config) {
      await config.onSetup(context);
    }
    _clearListeners = _setupListeners(context, config.listeners);
    if (context.stats) {
      stats.render();
    }
    context.state = true;
  };
  const _dispose = () => {
    if (typeof _clearListeners === "function") {
      _clearListeners();
    }
    if (_frameId) {
      cancelAnimationFrame(_frameId);
    }
    if (context.stats) {
      stats.end();
    }
  };

  const _exec = () => {
    task();
    context.renderer.render(context.scene, context.camera);
    _frameId = requestAnimationFrame(_exec);
  };

  const ctx = {
    context: new Proxy(context, { set: () => false }),
    exec: _exec,
    dispose: _dispose,
    setup: _setup,
  };

  return ctx;
}

function _setupListeners(context, listeners) {
  const _orz = _onResize.bind(null, context, listeners.resize);
  const _omm = _onMouseMove.bind(null, context, listeners.mousemove);

  // list all listeners
  window.addEventListener("resize", _orz);
  window.addEventListener("mousemove", _omm);

  return () => {
    window.removeEventListener("resize", _orz);
    window.removeEventListener("mousemove", _omm);
  };
}

function _onMouseMove(context, mousemoveCallback, e) {
  const {
    env: { dimension, mouse2d },
  } = context;

  mouse2d.x = (e.pageX / dimension.vpWidth) * 2 - 1;
  mouse2d.y = -(e.pageY / dimension.vpHeight) * 2 + 1;

  if (mousemoveCallback) {
    const syntheticEvent = {
      context,
      nativeEvent: e,
    };
    mousemoveCallback(syntheticEvent);
  }
}

function _onResize(context, resizeCallback, e) {
  const resizedVPW = window.innerWidth;
  const resizedVPH = window.innerHeight;
  context.env.dimension.vpWidth = resizedVPW;
  context.env.dimension.vpHeight = resizedVPH;
  if (resizeCallback) {
    const syntheticEvent = {
      context,
      nativeEvent: e,
    };
    resizeCallback(syntheticEvent);
  }
}
