
uniform float time;
uniform float progress;
uniform float mosaic;
uniform float triScale;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
attribute vec3 center;

#include noise.glsl

float PI = 3.141592653589793238;

float backout(float progress, float swing){
  float p = progress - 1.;
  return (p * p * ((swing + 1.) * p + swing) + 1.);
}

void main(){
  vNormal = normal;
  vUv = uv;
  vec3 pos = position;

// progress*5. + transformStart
  // not gonna be over 1
  float tPos = pos.y;

  // if(tPos < -0.75){
  //  tPos  = 1.;
  // }

  float transformStart = -((tPos * 0.5) + 0.5 )*4.;


  float transformProgress = backout(clamp( progress*5. + transformStart, 0., 1.), 1.);


  // scaling the triangle but live in spot
  //triangles
  pos = (pos - center) * triScale + center;


  //pixelated
  vec3 posPixelated = floor(pos * mosaic + 0.5) / mosaic;
  pos = mix(pos,posPixelated, transformProgress);



  float noise = cnoise(vec4(pos, time * 0.3));

  float rotate = noise * PI * 0.018;
  pos += rotateF(pos, vec3(1.,0.,0.), rotate);
  pos += rotateF(pos, vec3(0.,1.,0.), rotate);
  pos += rotateF(pos, vec3(0.,1.,1.), rotate);


  float scale = 1.0 + noise * 0.035;// * sin(time * 0.1);
  pos *= scale;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vPosition = position;

}

