const Test = (config) => {
  const DEFAULT_ROUND = config?.round || 10;
  const wasmMode = config?.wasmMode || 0;
  const name = `WASM(${wasmMode === 1 ? "opt" : "noopt"}) & Vanila Performance comparison`;

  function run(func, verbose = false) {
    const start = performance.now();
    func();
    const end = performance.now();

    if (verbose) {
      console.log(`Execution took ${end - start}ms`);
    }
    return end - start;
  }

  return {
    measure: (Suite, count = DEFAULT_ROUND, verbose = false) => {
      const wasmRes = [];
      const vanilaRes = [];

      console.log(`Starting ${name}....`);
      console.log(`Suite name : ${Suite.name}`);
      Suite.init.call(Suite, [count]);
      if (verbose) {
        console.log("Running on env : WASM");
      }
      for (let i = 0; i < count; i++) {
        wasmRes.push(run(Suite.wasm.bind(Suite, [i]), verbose));
      }

      if (verbose) {
        console.log("Running on env : Vanila");
      }

      for (let i = 0; i < count; i++) {
        vanilaRes.push(run(Suite.vanila.bind(Suite, [i]), verbose));
      }

      const vanilaAv =
        vanilaRes.reduce((acc, val) => {
          return acc + val;
        }, 0) / count;
      const wasmAv =
        wasmRes.reduce((acc, val) => {
          return acc + val;
        }, 0) / count;
      console.log(`For ${count} rounds..`);

      if (vanilaAv < wasmAv) {
        console.log(`%c Vanila took ${vanilaAv}ms average`, "color: #00ff00; background-color: #000000");
        console.log(`%c WASM took ${wasmAv}ms average`, "color: #ffff00; background-color: #000000");
      } else if (vanilaAv > wasmAv) {
        console.log(`%c Vanila took ${vanilaAv}ms average`, "color: #ffff00; background-color: #000000;");
        console.log(`%c WASM took ${wasmAv}ms average`, "color: #00ff00; background-color: #000000;");
      } else {
        console.log(`%c Vanila took ${vanilaAv}ms average`, "color: #00ff00; background-color: #000000;");
        console.log(`%c WASM took ${wasmAv}ms average`, "color: #00ff00; background-color: #000000;");
      }
    },
  };
};

class LoopTest {
  constructor(iteration = 10) {
    this.name = `Loop Test (${iteration}  iteration)`;
    // custom
    this.iteration = iteration;
  }
  vanila() {
    for (let i = 0; i < this.iteration; i++) {}
    return;
  }
  wasm() {
    Module.loopTest(this.iteration);
    return;
  }
}

class FuncCallTest {
  constructor(callCount = 10, iteration = 10) {
    this.name = `Function Call Test :: ${callCount} calls with each function takes ${iteration}  iteration`;
    // custom
    this.iteration = iteration;
    this.callCount = callCount;
  }

  task() {
    let a = 0;
    for (let i = 0; i < this.iteration; i++) {
      a++;
    }
    return a;
  }
  vanila() {
    for (let i = 0; i < this.callCount; i++) {
      this.task();
    }
    return;
  }
  wasm() {
    for (let i = 0; i < this.callCount; i++) {
      Module.loopTest(this.iteration);
    }
    return;
  }
}

class MapReadTest {
  constructor(wideness = 10) {
    this.name = `Object Getter Width Test :: wideness - ${wideness} `;
    // custom
    this.wideness = wideness;
    this.map = new Map();
    this.case = [];
  }

  init(round) {
    for (let i = 0; i < this.wideness; i++) {
      this.map.set(i, i);
    }

    Module.MapReadTestInit(this.wideness);

    for (let i = 0; i < round; i++) {
      this.case.push(Math.floor(Math.random() * this.wideness));
    }
  }
  vanila(search) {
    this.map.get(this.case[search]);
  }
  wasm(search) {
    Module.MapReadTest(this.case[search]);
  }
}
