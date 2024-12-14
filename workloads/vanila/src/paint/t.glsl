//https://www.14islands.com/

uniform vec3 bgColor;
uniform float time;
uniform float delta;
uniform float fadeSpeed;
uniform float lineStrength;
uniform float bleedSpeed;
uniform float bleedThreshold;
uniform float displacement;
uniform float noiseFrequency;
uniform int noiseOctaves;
uniform float bleedBlur;
uniform float lineBlur;
uniform float saturation;
uniform float luminosity;

uniform float aspectRatio;
uniform sampler2D map;
uniform sampler2D trailTexture;

varying vec2 vUv;


void main() {
  vec2 aspect = vec2(1.0, aspectRatio); 
  
   // Trail texture - drawing input
  vec4 trail = texture2D(trailTexture, vUv, lineBlur); // FBO frame
  
  vec4 texel = texture2D(map, vUv);// Displacement amount
  
  float amp = displacement * 0.01; // FBM noise
  
  vec2 disp = fbm(vUv * noiseFrequency, noiseOctaves) * amp * aspect;
  
  // Create bleed based on noise
  vec4 texel2 = texture2D(map, vec2(vUv.x + disp.x, vUv.y), bleedBlur);
  vec4 texel3 = texture2D(map, vec2(vUv.x, vUv.y + disp.y), bleedBlur);
  vec4 texel4 = texture2D(map, vec2(vUv.x - disp.x, vUv.y), bleedBlur);    
  vec4 texel5 = texture2D(map, vec2(vUv.x, vUv.y - disp.y), bleedBlur);
  
  vec3 fcolor = texel.rgb;
  
  fcolor = blendDarken(fcolor, texel2.rgb);
  fcolor = blendDarken(fcolor, texel3.rgb);
  fcolor = blendDarken(fcolor, texel4.rgb);
  fcolor = blendDarken(fcolor, texel5.rgb);
  
  // LINE COLOR    
  
  vec3 gradientColor = hsl2rgb(mod(time*100./360.0, 1.0), saturation, luminosity);
  float line = smoothstep(0.0, 1.0, trail.r);
  vec3 lineColor = mix(vec3(1.), gradientColor, line);
  
  // Mix last frame with new bleed color
  vec3 waterColor = blendDarken(texel.rgb, fcolor.rgb * (1. + bleedThreshold * delta), bleedSpeed);
  
  // Blend watercolor with line
  vec3 finalColor = blendDarken(waterColor.rgb, lineColor.rgb, lineStrength);
  
  // Fade out old drawings towards bg color
  gl_FragColor.rgba = vec4(min(bgColor, finalColor * (1. + fadeSpeed * delta)), 1.);
}

// void main() {
//   vec2 aspect = vec2(1.0, aspectRatio);
  
//   // Trail texture - drawing input
//   vec4 trail = texture2D(trailTexture, vUv, lineBlur);
  
//   // FBO frame (we draw on top of last frame)
//   vec4 texel = texture2D(map, vUv);
//   // Displacement amount
  
//   float amp = displacement * 0.01;
  
//   // FBM noise
//   vec2 disp = fbm(vUv * noiseFrequency, noiseOctaves) * amp * aspect;
  
//   // Create bleed based on noise
//   vec4 texel2 = texture2D(map, vec2(vUv.x + disp.x, vUv.y), bleedBlur);
//   vec4 texel3 = texture2D(map, vec2(vUv.x, vUv.y + disp.y), bleedBlur);
//   vec4 texel4 = texture2D(map, vec2(vUv.x - disp.x, vUv.y), bleedBlur);
//   vec4 texel5 = texture2D(map, vec2(vUv.x, vUv.y - disp.y), bleedBlur);
  
//   vec3 fcolor = texel.rgb;
//   fcolor = blendDarken(fcolor, texel2.rgb);
//   fcolor = blendDarken(fcolor, texel3.rgb);
//   fcolor = blendDarken(fcolor, texel4.rgb);
//   fcolor = blendDarken(fcolor, texel5.rgb);
  
//   // LINE COLOR
//   vec3 gradientColor = hsl2rgb(mod(time*100./360.0, 1.0), saturation, luminosity);
//   float line = smoothstep(0.0, 1.0, trail.r);
//   vec3 lineColor = mix(vec3(1.), gradientColor, line);
  
//    // Mix last frame with new bleed color
//    vec3 waterColor = blendDarken(texel.rgb, fcolor.rgb * (1. + bleedThreshold * delta), bleedSpeed);
   
//    // Blend watercolor with line
//    vec3 finalColor = blendDarken(waterColor.rgb, lineColor.rgb, lineStrength);
   
//   // Fade out old drawings towards bg color
//   gl_FragColor.rgba = vec4(min(bgColor, finalColor * (1. + fadeSpeed * delta)), 1.);
  
//   // debug noise
//   // gl_FragColor.rgba = vec4(vec3(fbm(vUv * noiseFrequency, noiseOctaves)), 1.0);
  
//   // debug trail
//   // gl_FragColor.rgba = vec4(trail.rgb, 1.0);

// }


//Fractal noise from https://github.com/yiwenl/glsl-fbm

// Modified signature to accept num octaves as an optional 2nd parameter


// #define NUM_OCTAVES 5


// float rand_fbm_1540259130(vec2 n) {
//   return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
// }

// float noise(vec2 p){
//   vec2 ip = floor(p);
//   vec2 u = fract(p);
//   u = u*u*(3.0-2.0*u);
  
//   float res = mix(
//     mix(rand_fbm_1540259130(ip),rand_fbm_1540259130(ip+vec2(1.0,0.0)),u.x),
//     mix(rand_fbm_1540259130(ip+vec2(0.0,1.0)),rand_fbm_1540259130(ip+vec2(1.0,1.0)),u.x),u.y);
    
//     return res*res;
// }
// float fbm(vec2 x, int numOctaves) {
//   float v = 0.0;
//   float a = 0.5;
//   vec2 shift = vec2(100);
//   // Rotate to reduce axial bias
//   mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  
//   for (int i = 0; i < numOctaves; ++i) {
//     v += a * noise(x);
//     x = rot * x * 2.0 + shift;
//     a *= 0.5;
//     }
//   return v;
// }
  
// float fbm(vec2 x) {
//   return fbm(x, NUM_OCTAVES);
// }

// float hue2rgb(float f1, float f2, float hue) {
//   if (hue < 0.0)
//     hue += 1.0;
//   else if (hue > 1.0)
//     hue -= 1.0;
//   float res;
//   if ((6.0 * hue) < 1.0)
//     res = f1 + (f2 - f1) * 6.0 * hue;
//   else if ((2.0 * hue) < 1.0)
//     res = f2;
//   else if ((3.0 * hue) < 2.0)
//     res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
//   else
//     res = f1;
//   return res;
// }

// vec3 hsl2rgb(vec3 hsl) {
//   vec3 rgb;
  
//   if (hsl.y == 0.0) {
//     rgb = vec3(hsl.z); // Luminance
//   } else {
//     float f2;
    
//     if (hsl.z < 0.5)
//       f2 = hsl.z * (1.0 + hsl.y);
//     else
//       f2 = hsl.z + hsl.y - hsl.y * hsl.z;
    
//     float f1 = 2.0 * hsl.z - f2;
    
//     rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
//     rgb.g = hue2rgb(f1, f2, hsl.x);
//     rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
//   }
//   return rgb;
// }

// vec3 hsl2rgb(float h, float s, float l) {
//   return hsl2rgb(vec3(h, s, l));
// }
// float blendDarken(float base, float blend) {
//   return min(blend,base);
// }

// vec3 blendDarken(vec3 base, vec3 blend) {
//   return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
// }
// vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
//   return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
// }