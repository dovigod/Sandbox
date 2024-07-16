

uniform float time;
uniform sampler2D uDiffuse;
uniform sampler2D uPrev;
uniform vec4 uResolution;
varying vec3 vPosition;
varying vec2 vUv;


float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

float fbm(vec2 x, int numOctaves) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < numOctaves; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

// drawings..
void main(){
  vec4 color = texture2D(uDiffuse, vUv); // mouse movement
  vec4 prev = texture2D(uPrev, vUv); // previous frame


  vec2 aspect = vec2(1., uResolution.y / uResolution.x);
  //fbm noise
  vec2 disp = aspect * (fbm(vUv * 22.0, 4)) * 0.005; // speed of color spread


  // 

  gl_FragColor = prev;
  // gl_FragColor = vec4(disp, 0., 1.);
}
// now display this image, and preserve the result