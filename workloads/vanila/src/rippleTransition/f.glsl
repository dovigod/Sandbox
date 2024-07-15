uniform float time;
varying vec3 vPosition;
varying vec2 vUv;
uniform sampler2D uVideo;
uniform vec2 uViewport;
uniform sampler2D uImage;
uniform float uCircleScale;
uniform vec2 uMediaDimension;

mat2 rot2d (in float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float r (in float a, in float b){
  return fract(sin(dot(vec2(a,b), vec2(12.9898, 78.233)))* 43758.5453); 
}

float h (in float a){
  return fract(sin(dot(a, dot(12.9898, 78.233))) * 43758.5453);
}

float noise(in vec3 x){
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3. - 2. * f);
  float n = p.x + p.y * 57. + 113. * p.z;
  return mix(mix(mix( h(n + 0.), h(n + 1.), f.x),
    mix( h(n + 57.), h(n + 58.), f.x), f.y),
    mix( mix( h(n+113.), h(n+114.), f.x),
      mix( h(n + 170.), h(n+171.), f.x), f.y),f.z);
}

vec3 dnoise2f (in vec2 p){
  float i = floor(p.x), j = floor(p.y);
  float u = p.x - i , v = p.y - j;
  float du = 30. * u*u*(u*(u-2.)+1.);
  float dv = 30.*v*v*(v*(v-2.)+1.);
  u = u*u*u*(u*(u*6. - 15.)+10.);
  v = v*v*v*(v*(v*6. - 15.)+10.);
  float a = r(i , j );
  float b = r(i + 1., j);
  float c = r(i, j + 1.);
  float d = r(i+1., j+1.);
  float k0 = a;
  float k1 = b -a ;
  float k2 = c- a;
  float k3 = a - b -c +d;
  return vec3(k0 + k1 * u + k2*v + k3*u*v , du*(k1 + k3*v), dv*(k2+k3*u));
}

float fbm(in vec2 uv){
  vec2 p = uv;
  float f, dx, dz, w = 0.5;
  f = dx = dz = 0.0;
  for(int i = 0 ; i < 3 ;++i){
    vec3 n = dnoise2f(uv);
    dx += n.y;
    dz += n.z;
    f += w * n.x / (1. + dx*dx + dz*dz);
    w *= 0.86;
    uv *= vec2(1.36);
    uv *= rot2d(1.25*noise(vec3(p * 0.1, 0.12 * time)) +
      0.75 * noise(vec3(p * 0.1 , 0.2 * time))
    );
  }
  return f;
}

float fbmLow(in vec2 uv){
  float f, dx,dz,w = 0.5;
  f = dz = dx = 0.0;
  for(int i = 0; i < 3; ++i){
    vec3 n = dnoise2f(uv);
    dx += n.y;
    dz += n.z;
    f += w * n.x / (1.0 + dx * dx + dz* dz);
    w *= 0.95;
    uv *= vec2(3.);
  }
  return f;
}



float circle(vec2 uv, float radius , float sharpness){
  vec2 circleUV = uv - vec2(0.5);


// length of vector
  return 1.0 - smoothstep(
    radius - radius * sharpness,
    radius + radius * sharpness,
    dot(uv , uv) * 16. // to lower scaling vel
  );
}

void main(){
  float scaleFactor = uCircleScale;


  float mediaRatio = uMediaDimension.x / uMediaDimension.y;
  float viewportRatio = uViewport.x / uViewport.y;

  vec2 resizeFactor = vec2(1.);


 
  if(mediaRatio > viewportRatio){
    resizeFactor = vec2(viewportRatio / mediaRatio, 1.);
  }else{
    resizeFactor = vec2(mediaRatio / viewportRatio, 1.);
  }
  vec2 center = vUv - vec2(0.5);
  vec2 scaledUV = (vUv - vec2(0.5))* resizeFactor + vec2(0.5);



  
  vec2 circleUV = (vUv - vec2(0.5)) * vec2(1., 1./viewportRatio);
  float radius = uCircleScale;
  float opaque = 0.5 * uCircleScale;

  float circle = smoothstep(
    radius - radius * opaque,
    radius + radius * opaque,
    10. * dot(circleUV, circleUV)
  );

  vec2 noiseUV = vUv - vec2(0.5) ;

  noiseUV *= rot2d(time * 10.5);

  vec2 rv = noiseUV / (length(noiseUV * 20.) * noiseUV * 20.); // for normalizing  ripple gap
  float swirl = 20. *fbm(noiseUV * fbmLow(vec2(length(noiseUV) - time / 2. + rv )));
  vec2 swirlDistort = fbmLow(noiseUV * swirl) * (vUv - vec2(0.5)) * 10.;

  noiseUV *= rot2d(time * -4.5);


// distortion at edge of circle
  vec2 backgroundUV= scaledUV + (0.03 * swirlDistort - (center) * circle) - 0.2*center * uCircleScale; 

  vec4 video= texture2D(uVideo, backgroundUV );
  vec4 image = texture2D(uImage, scaledUV);
  
  vec4 effect = mix(video,image, circle);

  gl_FragColor = effect;
}




