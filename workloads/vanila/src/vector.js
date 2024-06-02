import { Animator, Canvas } from "@packages/animation";
import { normalize, Vector } from "./xxx";
const canvas = new Canvas("stage");
const animator = new Animator();

canvas.initialize();

const ctx = canvas.context;

// why vector? -> reduce computing resource  (1)
function c1_1() {
  let unitTime = 10;
  // example
  let x_pos = 1;
  let y_pos = 2;
  let x_vel = 0.1;
  let y_vel = 0.1;

  x_pos += x_vel * unitTime;
  y_pos += y_vel * unitTime;

  console.log("Scala Expression :: ", x_pos, y_pos);

  // a specific point is a vector which has starting point from origin  (2)
  const vecA = new Vector(1, 2);
  const speed = new Vector(2, 4);
  vecA.add(speed);
  console.log("Vector Expression :: ", vecA);
  // seems the only advantage of vector is well organized DataStructure..? (4)
}

// useful vector operation as tool
function c1_4() {
  const vecA = new Vector(1, 2);
  const vecB = new Vector(2, 4);
  const vecC = new Vector(3, 6);

  // lerp , dist, dot, cross ,normalize

  // normalize -> reduce vector size to 1
  // normalze(Vec) = Vec( vec.x / size(vec) , vec.y / size(vec))

  // dot -> to get angle between each vector || projection to specifc vector or field
  // dot(vecA, vecB) = size(VecA) * size(VecB) cos(theta);
  // if normalized => acos(dot) = theta

  // cross -> to get orthogonal vector of two vector  (d >= 3);
  // vec(x,y) => sqrt(x,y)

  // lerp -> linear interpolation  ex) beizer curve & quadratic, timing func etc..
  // lerp(a, b, t) = a + (b — a) * t
}

const pointer = { x: 0, y: 0 };
const POINTER_RADIUS = 30;
window.addEventListener("mousemove", (e) => {
  pointer.x = e.x;
  pointer.y = e.y;
});

function collision(ball) {}
function drawPointer() {
  ctx.beginPath();
  ctx.fillStyle = "#0000ff";
  ctx.arc(pointer.x, pointer.y, POINTER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

async function withInterupt(ball) {
  return await new Promise((resolve) => {
    setTimeout(() => {
      ball.addForce(new Vector(1, 0));
      resolve(ball);
    }, 2000);
  });
}
function withForce(ball, cnt) {
  ball.addForce(new Vector(0, 0.2 * cnt));
  return ball;
}
function withFriction(ball) {
  ball.useFriction = true;
  return ball;
}
class FuzzyBall {
  constructor(x, y, r) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.radius = r;
    this.color = "#ff0000";
    this.mass = Math.PI * Math.pow(r, 2);
    this.useFriction = false;
  }
  addForce(vec) {
    // f = ma but simplified
    this.acc.add(vec);
  }

  update() {
    if (this.useFriction) {
      this.applyFriction();
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc = new Vector(0, 0);
  }
  render() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  applyFriction() {
    const VEL = this.vel > 0 ? -0.001 : 0.001;
    if (Math.abs(this.vel.x) < Math.abs(VEL)) {
      this.vel.x = 0;
    } else {
      this.vel.x -= VEL;
    }
    if (Math.abs(this.vel.y) < Math.abs(VEL)) {
      this.vel.y = 0;
    } else {
      this.vel.y -= VEL;
    }
  }
}

const ball = new FuzzyBall(300, window.innerHeight / 2, 20);

function draw() {
  ctx.fillStyle = "rgba(255,255,255,0.01)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ball.update();
  ball.render();
  // drawPointer();
}

// withFriction(ball);
ball.addForce(new Vector(1, 0));
withInterupt(ball);
// withForce(ball, -3);

animator.register(draw);

animator.animate();
