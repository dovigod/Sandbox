uniform float uTime;

attribute vec2 aAnimation;
attribute vec3 aCentroid;
attribute vec3 aCp0;
attribute vec3 aCp1;
attribute vec3 aDestination;



vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float time)
{
    vec3 res;
    float next = 1.0 - time;
    res.xyz = next * next * next * p0.xyz + 3.0 * next * next * time * c0.xyz + 3.0 * next * time * time * c1.xyz + time * time * time * p1.xyz;
    return res;
}

float ease(float t, float b, float c, float d) {
  return c*((t=t/d - 1.0)*t*t + 1.0) + b;
}

float random(vec3 p){
  return fract(sin(p.x + p.y + p.z));
}

void main() {
  float delay = aAnimation.x;
  float duration = aAnimation.y;
  float time = clamp(uTime - delay, 0.0, duration);
  // float progress =  ease(tTime, 0.0, 1.0, duration);
  float progress = time / duration;


  vec3 transformed = position;

  transformed *= 1.0 - progress;

  transformed += cubicBezier(transformed, aCp0, aCp1, aDestination, progress);

  // transformed = transformed - aCentroid;
  // float cof = step(0.99 , random(position));
  // if(cof == 1.0){
  //   transformed += cubicBezier(transformed, aCp0, aCp1, aDestination, progress);
  // }else{
  //   transformed += (cubicBezier(transformed,aCp1, aCp0, aDestination, progress));
  // }
  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}