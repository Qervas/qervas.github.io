import * as THREE from "three";

const skyVert = /* glsl */ `
varying vec3 vWorldDir;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldDir = world.xyz - cameraPosition;
  vec4 clip = projectionMatrix * viewMatrix * world;
  clip.z = clip.w;
  gl_Position = clip;
}
`;

const skyFrag = /* glsl */ `
precision highp float;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform float uExposure;
uniform float uTime;
varying vec3 vWorldDir;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){ float v=0., a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.05; a*=0.5; } return v; }

void main(){
  vec3 rd = normalize(vWorldDir);
  float h = rd.y;
  vec3 col = mix(uHorizon, uZenith, pow(smoothstep(-0.12, 0.9, h), 0.5));
  col = mix(col, uHorizon * 1.2, exp(-max(h,0.) * 5.5) * 0.55);
  vec3 L = normalize(uSunDir);
  float mu = max(dot(rd, L), 0.0);
  col += uSunColor * (smoothstep(0.9994, 0.99996, mu) * 10.0 + pow(mu, 28.0) * 0.7 + pow(mu, 3.5) * 0.35);
  float cloudBand = smoothstep(0.02, 0.22, h) * smoothstep(0.6, 0.18, h);
  vec2 cp = rd.xz / max(abs(h)+0.05, 0.08) * 1.6 + vec2(uTime*0.008, uTime*0.004);
  col = mix(col, mix(col, vec3(0.95,0.97,1.0), 0.65), cloudBand * smoothstep(0.45,0.75,fbm(cp)) * 0.5);
  float night = smoothstep(0.12, -0.08, L.y);
  if (night > 0.01 && h > 0.08) col += vec3(0.85,0.9,1.0) * step(0.9965, hash(floor(rd.xy*260.0))) * night;
  col *= uExposure;
  col = clamp((col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14), 0.0, 1.0);
  col = pow(col, vec3(1.0/2.2));
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createSkyMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    uniforms: {
      uSunDir: { value: new THREE.Vector3(0.4, 0.7, 0.3).normalize() },
      uSunColor: { value: new THREE.Color(1, 0.95, 0.8) },
      uZenith: { value: new THREE.Color(0.15, 0.38, 0.78) },
      uHorizon: { value: new THREE.Color(0.6, 0.78, 0.95) },
      uExposure: { value: 1.25 },
      uTime: { value: 0 },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });
}

export function sunFromTimeOfDay(tod) {
  const elev = Math.sin((tod - 0.25) * Math.PI * 2);
  const azim = tod * Math.PI * 2;
  const dir = new THREE.Vector3(
    Math.cos(elev) * Math.sin(azim),
    elev,
    Math.cos(elev) * Math.cos(azim),
  ).normalize();
  const day = THREE.MathUtils.smoothstep(elev, -0.1, 0.25);
  const sunset =
    THREE.MathUtils.smoothstep(elev, -0.05, 0.15) *
    (1 - THREE.MathUtils.smoothstep(elev, 0.15, 0.45));
  const sunColor = new THREE.Color().setRGB(
    1.0,
    THREE.MathUtils.lerp(0.55, 0.95, day),
    THREE.MathUtils.lerp(0.25, 0.78, day),
  );
  if (sunset > 0.01) sunColor.lerp(new THREE.Color(1.0, 0.48, 0.22), sunset * 0.75);
  const zenith = new THREE.Color().setRGB(
    THREE.MathUtils.lerp(0.02, 0.18, day),
    THREE.MathUtils.lerp(0.04, 0.4, day),
    THREE.MathUtils.lerp(0.1, 0.82, day),
  );
  const horizon = new THREE.Color().setRGB(
    THREE.MathUtils.lerp(0.05, 0.62, day) + sunset * 0.45,
    THREE.MathUtils.lerp(0.06, 0.72, day) + sunset * 0.18,
    THREE.MathUtils.lerp(0.14, 0.95, day) * (1 - sunset * 0.25),
  );
  const deep = new THREE.Color().setRGB(
    THREE.MathUtils.lerp(0.002, 0.008, day),
    THREE.MathUtils.lerp(0.02, 0.055, day),
    THREE.MathUtils.lerp(0.045, 0.11, day),
  );
  const shallow = new THREE.Color().setRGB(
    THREE.MathUtils.lerp(0.008, 0.028, day) + sunset * 0.08,
    THREE.MathUtils.lerp(0.1, 0.3, day),
    THREE.MathUtils.lerp(0.14, 0.36, day),
  );
  const exposure = THREE.MathUtils.lerp(0.55, 1.05, day) + sunset * 0.12;
  return { dir, sunColor, zenith, horizon, deep, shallow, exposure };
}
