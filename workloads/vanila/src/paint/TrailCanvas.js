import * as THREE from "three";

// export class TrailCanvas {
//   constructor({
//     width = document.body.offsetWidth,
//     height = document.body.offsetHeight,
//     maxAge = 750,
//     radius = 0.3,
//     intensity = 0.2,
//     interpolate = false,
//     smoothing = 0,
//     minForce = 0.3,
//     blend = "screen",
//     ease = (x) => {
//       return 1 - Math.pow(1 - x, 3);
//     },
//   } = {}) {
//     this.width = width;
//     this.height = height;
//     this.size = Math.min(this.width, this.height);
//     this.maxAge = maxAge;
//     this.radius = radius;
//     this.intensity = intensity;
//     this.ease = ease;
//     this.interpolate = interpolate;
//     this.smoothing = smoothing;
//     this.minForce = minForce;
//     this.blend = blend;
//     this.trail = [];
//     this.force = 0;
//     this.initTexture();
//   }

//   initTexture() {
//     this.canvas = document.createElement("canvas");
//     this.canvas.width = this.width;
//     this.canvas.height = this.height;
//     this.ctx = this.canvas.getContext("2d");
//     this.ctx.fillStyle = "black";
//     this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//     this.texture = new THREE.Texture(this.canvas);
//     this.canvas.id = "touchTexture";
//     this.canvas.style.width = this.canvas.width + "px";
//     this.canvas.style.height = this.canvas.height + "px";
//     this.canvas.style.position = "absolute";
//     this.canvas.style.top = "0px";
//     this.canvas.style.left = "0px";
//     document.body.appendChild(this.canvas);
//   }
//   update(time) {
//     this.clear();
//     this.trail.forEach((trail, idx) => {
//       trail.age += 1e1 * time;
//       trail.age > this.maxAge && this.trail.splice(idx, 1);
//     });

//     this.trail.length || (this.force = 0);
//     this.trail.forEach((trail) => {
//       this.drawTouch(trail);
//     });
//     this.texture.needsUpdate = true;
//   }
//   clear() {
//     this.ctx.globalCompositeOperation = "source-over";
//     this.ctx.fillStyle = "black";
//     this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//   }
//   addTouch(touch) {
//     let prevTrail = this.trail[this.trail.length - 1];

//     if (prevTrail) {
//       let distanceX = prevTrail.x - touch.x;
//       let distanceY = prevTrail.y - touch.y;

//       let distance = distanceX * distanceX + distanceY * distanceY; // n
//       let power = Math.max(this.minForce, Math.min(1e4 * distance, 1));

//       this._updateForce(power, this.force, this.smoothing);

//       if (this.interpolate) {
//         // create dots to interpolate distance
//         let offsetCnt = Math.ceil(distance / Math.pow((0.5 * this.radius) / this.interpolate, 2));

//         if (offsetCnt > 1) {
//           for (let i = 1; i < offsetCnt; i++) {
//             this.trail.push({
//               x: prevTrail.x - (distanceX / offsetCnt) * i,
//               y: prevTrail.y - (distanceY / offsetCnt) * i,
//               age: 0,
//               force: power,
//             });
//           }
//         }
//       }
//     }

//     this.trail.push({
//       x: touch.x,
//       y: touch.y,
//       age: 0,
//       force: this.force,
//     });
//   }

//   drawTouch(trail) {
//     let trailPaint = {
//       x: trail.x * this.width,
//       y: (1 - trail.y) * this.height,
//     };

//     let lifespanPaint = 1;
//     const agingInflectionPoint = 0.3;

//     lifespanPaint =
//       (trail.age < agingInflectionPoint * this.maxAge
//         ? this.ease(trail.age / (agingInflectionPoint * this.maxAge))
//         : this.ease(
//             1 - (trail.age - agingInflectionPoint * this.maxAge) / ((1 - agingInflectionPoint) * this.maxAge),
//           )) * trail.force;

//     this.ctx.globalCompositeOperation = this.blend;
//     let paintRadius = this.size * this.radius * lifespanPaint;
//     let gradient = this.ctx.createRadialGradient(
//       trailPaint.x,
//       trailPaint.y,
//       Math.max(0, 0.25 * paintRadius),
//       trailPaint.x,
//       trailPaint.y,
//       Math.max(0, paintRadius),
//     );

//     const startColor = `rgba(255,255,255,${this.intensity})`;
//     const endColor = "rgba(0,0, 0, 0.0)";

//     gradient.addColorStop(0, startColor);
//     gradient.addColorStop(1, endColor);
//     this.drawCircle(trailPaint.x, trailPaint.y, Math.max(0, paintRadius), gradient);
//   }

//   drawCircle(x, y, r, color) {
//     this.ctx.beginPath;
//     this.ctx.fillStyle = color;
//     this.ctx.arc(x, y, Math.max(0, r), 0, 2 * Math.PI);
//     this.ctx.fill();
//   }

//   _updateForce(forceS) {
//     const lerpFactor = this.smoothing || 0.9;
//     this.force = lerp(forceS, this.force, lerpFactor);
//   }
// }

// function lerp(v1, v2, f) {
//   return f * v1 + v2 * (1 - f);
// }

export class TrailCanvas {
  initTexture() {
    (this.canvas = document.createElement("canvas")),
      (this.canvas.width = this.width),
      (this.canvas.height = this.height),
      (this.ctx = this.canvas.getContext("2d")),
      (this.ctx.fillStyle = "black"),
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height),
      (this.texture = new THREE.Texture(this.canvas)),
      (this.canvas.id = "touchTexture");
    // this.canvas.style.width = this.canvas.width + "px";
    // this.canvas.style.height = this.canvas.height + "px";
    // this.canvas.style.position = "fixed";
    // this.canvas.style.top = "0px";
    // this.canvas.style.left = "0px";
    // document.body.appendChild(this.canvas);
  }
  update(e) {
    this.clear(),
      this.trail.forEach((t, i) => {
        // 1e4 * e
        (t.age += 1e3 * e), t.age > this.maxAge && this.trail.splice(i, 1);
      }),
      this.trail.length || (this.force = 0),
      this.trail.forEach((e) => {
        this.drawTouch(e);
      }),
      (this.texture.needsUpdate = !0);
  }
  clear() {
    (this.ctx.globalCompositeOperation = "source-over"),
      (this.ctx.fillStyle = "black"),
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  addTouch(e) {
    let t = this.trail[this.trail.length - 1];

    if (t) {
      let i = t.x - e.x,
        r = t.y - e.y,
        n = i * i + r * r, // distance abb
        a = Math.max(this.minForce, Math.min(1e4 * n, 1)); // force
      if (
        ((this.force = (function (e, t) {
          let i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0.9;

          return t * i + e * (1 - i);
        })(a, this.force, this.smoothing)),
        this.interpolate)
      ) {
        let e = Math.ceil(n / Math.pow((0.5 * this.radius) / this.interpolate, 2));

        if (e > 1) {
          for (let n = 1; n < e; n++)
            this.trail.push({
              x: t.x - (i / e) * n,
              y: t.y - (r / e) * n,
              age: 0,
              force: a,
            });
        }
      }
    }
    this.trail.push({
      x: e.x,
      y: e.y,
      age: 0,
      force: this.force,
    });
  }
  drawTouch(e) {
    let t = {
        x: e.x * this.width,
        y: (1 - e.y) * this.height,
      },
      i = 1;
    (i =
      (e.age < 0.3 * this.maxAge
        ? this.ease(e.age / (0.3 * this.maxAge))
        : this.ease(1 - (e.age - 0.3 * this.maxAge) / (0.7 * this.maxAge))) * e.force),
      (this.ctx.globalCompositeOperation = this.blend);
    let r = this.size * this.radius * i,
      n = this.ctx.createRadialGradient(t.x, t.y, Math.max(0, 0.25 * r), t.x, t.y, Math.max(0, r));
    n.addColorStop(0, "rgba(255, 255, 255, ".concat(this.intensity, ")")),
      n.addColorStop(1, "rgba(0, 0, 0, 0.0)"),
      this.ctx.beginPath(),
      (this.ctx.fillStyle = n),
      this.ctx.arc(t.x, t.y, Math.max(0, r), 0, 2 * Math.PI),
      this.ctx.fill();
  }
  constructor({
    width: e = document.body.offsetWidth,
    height: t = document.body.offsetHeight,
    // width: e = 256,
    // height: t = 256,
    maxAge: i = 750,
    radius: r = 0.3, ///0.3
    intensity: n = 0.2,
    interpolate: a = 0,
    smoothing: s = 0,
    minForce: o = 0.3,
    blend: l = "screen",
    ease: u = (x) => {
      return 1 - Math.pow(1 - x, 3);
    },
  } = {}) {
    (this.width = e),
      (this.height = t),
      (this.size = Math.min(this.width, this.height)),
      (this.maxAge = i),
      (this.radius = r),
      (this.intensity = n),
      (this.ease = u),
      (this.interpolate = a),
      (this.smoothing = s),
      (this.minForce = o),
      (this.blend = l),
      (this.trail = []),
      (this.force = 0),
      this.initTexture();
  }
}
