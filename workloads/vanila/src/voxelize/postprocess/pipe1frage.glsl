uniform sampler2D current;
uniform sampler2D prev;
uniform float diffusion;
uniform float start;
uniform float time;
uniform float translate;
varying vec2 vUv;



void main(){
  float PI = 3.14159265359;
  vec2 uv = vUv;
  uv -= vec2(0.5);

  uv *= vec2(2.,1.);
  uv.y += translate;

  uv = uv / 5.0;

  uv.x += sin(uv.y * PI * 4. - time*0.1) * 0.15;
  uv.x += sin(uv.y * PI * 16. - time*0.1) * 0.15;

  uv += vec2(0.5);

  uv = mix(vUv, uv, diffusion);


  vec4 currentColor = texture2D(current, uv);
  vec4 prevColor = texture2D(prev, vUv);
  vec4 color = vec4(// diffusion
    mix( prevColor.rgb,currentColor.rgb, 0.1), 1.
  );
  gl_FragColor = color;
  // gl_FragColor = vec4(vUv, 0.0, 1.0);
}