import { Animator, Canvas } from "@packages/animation";

const canvas = new Canvas("stage");
const animator = new Animator();

canvas.initialize();

const ctx = canvas.context;

let x = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.size.width, canvas.size.height);
  ctx.rect(0, 0, canvas.size.width, canvas.size.height);
  ctx.fillStyle = "#b197fc";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(200 - x, 200, 50, 0, 2 * Math.PI);
  ctx.fillStyle = "#faa2c1";
  ctx.fill();
  x += 0.1;
  ctx.closePath();
}

animator.register(draw);

animator.animate();
