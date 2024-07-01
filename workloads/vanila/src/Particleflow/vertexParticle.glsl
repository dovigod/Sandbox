uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D texture1;
uniform sampler2D uPositions;
varying vec4 vColor;


void main(){
  vUv = uv;
  vPosition = position;




  vec4 pos = texture2D(uPositions, uv);
  float angle = atan(pos.y , pos.x);

  vColor = 0.7 *  vec4(0.5 + 0.45 * sin(angle + (time * 0.9) ));
  vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);

  gl_PointSize = 1. * (1. / - mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}