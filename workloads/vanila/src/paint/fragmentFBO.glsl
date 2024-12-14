
precision mediump float;
uniform float uTime;
uniform sampler2D uDiffuse;
uniform sampler2D uPrev;
uniform vec4 uResolution;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec4 uColor;
uniform float uFrame;

//
uniform sampler2D uTrailer;
uniform float uBleedBlur;
uniform float uLineBlur;
uniform float uSaturation;
uniform float uLuminosity;
uniform float uBleedThreshold;
uniform float uBleedSpeed;
uniform float uLineStrength;
uniform float uFadeSpeed;
uniform float uDisplacement;
uniform float uDelta;



#define NUM_OCTAVES 5


float rand_fbm_1540259130(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  
  float res = mix(
    mix(rand_fbm_1540259130(ip),rand_fbm_1540259130(ip+vec2(1.0,0.0)),u.x),
    mix(rand_fbm_1540259130(ip+vec2(0.0,1.0)),rand_fbm_1540259130(ip+vec2(1.0,1.0)),u.x),u.y);
    
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
  
float fbm(vec2 x) {
  return fbm(x, NUM_OCTAVES);
}

float hue2rgb(float f1, float f2, float hue) {
  if (hue < 0.0)
    hue += 1.0;
  else if (hue > 1.0)
    hue -= 1.0;
  float res;
  if ((6.0 * hue) < 1.0)
    res = f1 + (f2 - f1) * 6.0 * hue;
  else if ((2.0 * hue) < 1.0)
    res = f2;
  else if ((3.0 * hue) < 2.0)
    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
  else
    res = f1;
  return res;
}

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb;
  
  if (hsl.y == 0.0) {
    rgb = vec3(hsl.z); // Luminance
  } else {
    float f2;
    
    if (hsl.z < 0.5)
      f2 = hsl.z * (1.0 + hsl.y);
    else
      f2 = hsl.z + hsl.y - hsl.y * hsl.z;
    
    float f1 = 2.0 * hsl.z - f2;
    
    rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
    rgb.g = hue2rgb(f1, f2, hsl.x);
    rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
  }
  return rgb;
}

vec3 hsl2rgb(float h, float s, float l) {
  return hsl2rgb(vec3(h, s, l));
}
float blendDarken(float base, float blend) {
  return min(blend,base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
  return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}
vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
  return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}


//// cop

// float rand(vec2 n) { 
// 	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
// }

// float noise(vec2 p){
// 	vec2 ip = floor(p);
// 	vec2 u = fract(p);
// 	u = u*u*(3.0-2.0*u);
	
// 	float res = mix(
// 		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
// 		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
// 	return res*res;
// }

// float fbm(vec2 x, int numOctaves) {
// 	float v = 0.0;
// 	float a = 0.5;
// 	vec2 shift = vec2(100);
// 	// Rotate to reduce axial bias
//     mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
// 	for (int i = 0; i < numOctaves; ++i) {
// 		v += a * noise(x);
// 		x = rot * x * 2.0 + shift;
// 		a *= 0.5;
// 	}
// 	return v;
// }



// float blendDarken(float base, float blend){
//   return min(blend, base);
// }
// vec3 blendDarken(vec3 base, vec3 blend){
//   return vec3(blendDarken(base.r, blend.r),blendDarken(base.g, blend.g),blendDarken(base.b, blend.b) );
// }
// vec3 blendDarken(vec3 base, vec3 blend, float opacity){
//   return (blendDarken(base, blend))* opacity + base*(1.-opacity);}





// float hue2rgb(float f1, float f2, float hue){
//   if(hue < 0.0){
//     hue += 1.0;
//   }else if(hue > 1.0){
//     hue -= 1.0;
//   }

//   float res;

//   if((6.0 * hue) < 1.0){
//     res = f1 + (f2 - f1) * 6. * hue;
//   }else if((2.0 * hue) < 1.0){
//     res = f2;
//   }else if((3.0 * hue) < 2.0){
//     res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
//   }else{
//     res = f1;
//   }
//   return res;

// }
// vec3 hsl2rgb(vec3 hsl){
//   vec3 rgb;
//   if(hsl.y == 0.0){
//     rgb = vec3(hsl.z);
//   }else{
//     float f2;
//     if(hsl.z < 0.5){
//       f2 = hsl.z * (1.0 + hsl.y);
//     }else{
//       f2 = hsl.z + hsl.y - hsl.y * hsl.z;
//     }
//       float f1 = 2.0 * hsl.z - f2;
//       rgb.r = hue2rgb(f1, f2, hsl.x + (1.0 / 3.0));
//       rgb.g = hue2rgb(f1, f2, hsl.x);
//       rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/ 3.0));
//   }
//   return rgb;
// }

// vec3 hsl2rgb(float h, float s , float l ){
//   return hsl2rgb(vec3(h,s,l));
// }
// drawings..


float lerp(float a, float b, float t){
  float res = a + (b-a)*t;

  return res;
}
vec3 lerp(vec3 a, vec3 b, float t){
  return vec3(
    lerp(a.x,b.x,t),
    lerp(a.y,b.y,t),
    lerp(a.z,b.z,t)
    );
}

vec3 blend(vec3 x, vec3 y, float t){
  return vec3(
    mix(x.x, y.x, t),
    mix(x.y,y.y,t),
    mix(x.z,y.z,t)
  );
}

vec3 bgColor= vec3(1.,1.,1);
void main(){
  vec4 color = texture2D(uDiffuse, vUv); // mouse movement
  vec4 prev = texture2D(uPrev, vUv); // previous frame
  vec4 trail = texture2D(uTrailer, vUv, uLineBlur);

  vec2 aspect = vec2(1., 1.);

  float amp = uDisplacement * 0.01;
  //fbm noise
  vec2 distort =  (fbm(vUv * 14.0)) * aspect * amp;

  vec4 texel = texture2D(uPrev, vUv);
  vec4 texelXp = texture2D(uPrev, vec2(vUv.x + distort.x , vUv.y), uBleedBlur);
  vec4 texelXn = texture2D(uPrev, vec2(vUv.x - distort.x , vUv.y), uBleedBlur);
  vec4 texelYp = texture2D(uPrev, vec2(vUv.x, vUv.y + distort.y), uBleedBlur);
  vec4 texelYn = texture2D(uPrev, vec2(vUv.x, vUv.y - distort.y), uBleedBlur);

  vec3 floodColor = texel.rgb;
  floodColor = blendDarken(floodColor, texelXp.rgb);
  floodColor = blendDarken(floodColor, texelXn.rgb);
  floodColor = blendDarken(floodColor, texelYp.rgb);
  floodColor = blendDarken(floodColor, texelYn.rgb);

  // trail
  vec3 gradientColor = hsl2rgb(mod(uTime*100./360.0, 1.0), uSaturation, uLuminosity);
  float line = smoothstep(0.0, 1.0, trail.r);
  vec3 lineColor = mix(vec3(1.), gradientColor, line);

  vec3 waterColor = blendDarken(prev.rgb, floodColor.rgb * (1. + uBleedThreshold * uDelta), uBleedSpeed);
  
  // save
  vec3 finalColor = blendDarken(waterColor, lineColor, uLineStrength);

  gl_FragColor.rgba = vec4(min(bgColor, finalColor * (1.+ uFadeSpeed * uDelta )), 1.);

}