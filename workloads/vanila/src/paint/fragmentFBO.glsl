

uniform float time;
uniform sampler2D uDiffuse;
uniform sampler2D uPrev;
uniform vec4 uResolution;
varying vec3 vPosition;
varying vec2 vUv;
// drawings..
void main(){
  vec4 color = texture2D(uDiffuse, vUv);
  vec4 prev = texture2D(uPrev, vUv);
  gl_FragColor = prev + color;
}