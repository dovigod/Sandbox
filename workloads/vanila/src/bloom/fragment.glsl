
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float time;
varying vec3 vPosition;
varying vec2 vUv;

void main(){

  vec4 texture = texture2D(uTexture1 ,vUv);
  gl_FragColor = vec4(texture);
}