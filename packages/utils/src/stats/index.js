import Stats from "stats.js";

const stats = new Stats();

stats.render = () => {
  document.body.appendChild(stats.dom);
};

export { stats };
