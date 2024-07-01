uniform float time;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D uPositions;
varying vec4 vColor;

void main(){
  gl_FragColor = vec4(1.0,1.0,1.0,1.);

  gl_FragColor = vColor;
}