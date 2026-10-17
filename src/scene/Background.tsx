// The living background: a contour map of a drifting height field, drawn as fine lines on deep ink. It never stops
// moving, reacts to the pointer and to scroll speed, and changes colour with the page.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, ShaderMaterial, Vector2, Vector3, type Mesh } from "three";
import { PALETTE } from "../lib/palette";
import { scene, type Mood } from "../lib/store";
import { PROJECTS } from "../data/projects";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime; uniform vec2 uRes; uniform vec2 uPointer; uniform float uV; uniform float uDensity; uniform float uStrength;
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uInk; uniform vec3 uDeep;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw; return 130.0*dot(m,g);
  }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.4;
    float t = uTime * 0.045;
    vec2 q = vec2(snoise(p + vec2(0.0, t)), snoise(p + vec2(5.2, 1.3) - t));
    float h = snoise(p * 0.85 + q * 0.95 + vec2(t, 0.0)) * 0.5 + 0.5;
    vec2 pp = (uPointer * 0.5 + 0.5 - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.4;
    float dp = length(p - pp);
    h += uV * 0.12 * sin(dp * 9.0 - uTime * 3.0) * exp(-dp * 0.9);   // a ripple when you scroll fast
    h += 0.10 * exp(-dp * dp * 1.6);                                // the field rises toward the pointer
    float f = h * uDensity;
    float d = min(fract(f), 1.0 - fract(f)) / max(fwidth(f), 1e-4);
    float line = 1.0 - clamp(d, 0.0, 1.0);
    float major = 1.0 - clamp(min(fract(f / 5.0), 1.0 - fract(f / 5.0)) * 5.0 / max(fwidth(f), 1e-4), 0.0, 1.0);
    vec3 base = mix(uInk, uDeep, smoothstep(0.1, 0.9, h));
    vec3 tint = mix(uA, uB, smoothstep(0.25, 0.8, h));
    vec3 col = base + tint * (line * 0.22 + major * 0.28) * uStrength;
    col += uB * exp(-dp * dp * 1.2) * 0.09 * uStrength;              // soft light that follows the pointer
    col += uA * smoothstep(0.62, 1.0, h) * 0.05 * uStrength;         // glow on the high ground
    float vig = smoothstep(1.55, 0.35, length((uv - 0.5) * vec2(1.25, 1.0)));
    col *= mix(0.55, 1.0, vig);
    col += (hash(uv * uRes + uTime) - 0.5) * 0.018;                  // film grain
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface Look { a: string; b: string; density: number; strength: number }
const LOOKS: Record<Exclude<Mood, "detail">, Look> = {
  home: { a: PALETTE.amber, b: PALETTE.ice, density: 14, strength: 1.0 },
  projects: { a: PALETTE.teal, b: PALETTE.rose, density: 16, strength: 1.0 },
  stack: { a: PALETTE.rose, b: PALETTE.ice, density: 18, strength: 0.95 },
  lab: { a: PALETTE.teal, b: PALETTE.amber, density: 22, strength: 0.9 },
  journey: { a: PALETTE.amber, b: PALETTE.rose, density: 12, strength: 1.0 },
  contact: { a: PALETTE.ice, b: PALETTE.teal, density: 15, strength: 1.05 },
  lost: { a: PALETTE.rose, b: PALETTE.ice, density: 10, strength: 0.8 },
};

export function Background() {
  const mesh = useRef<Mesh>(null);
  const targets = useMemo(() => ({ a: new Color(), b: new Color() }), []);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 }, uRes: { value: new Vector2(1, 1) }, uPointer: { value: new Vector2() }, uV: { value: 0 },
          uDensity: { value: 14 }, uStrength: { value: 1 },
          uA: { value: new Color(PALETTE.amber) }, uB: { value: new Color(PALETTE.ice) },
          uInk: { value: new Vector3(...new Color(PALETTE.ink).toArray()) }, uDeep: { value: new Vector3(...new Color(PALETTE.deep).toArray()) },
        },
      }),
    [],
  );
  useFrame((state, dt) => {
    const u = mat.uniforms;
    const speed = scene.reduced ? 0.2 : 1;
    u.uTime.value += dt * speed;
    u.uRes.value.set(state.size.width * state.viewport.dpr, state.size.height * state.viewport.dpr);
    u.uPointer.value.set(scene.reduced ? 0 : scene.px, scene.reduced ? 0 : scene.py);
    u.uV.value += (Math.min(scene.scrollV, 1.5) * (scene.reduced ? 0 : 1) - u.uV.value) * 0.1;
    let look: Look;
    if (scene.mood === "detail") {
      const p = PROJECTS.find((x) => x.slug === scene.activeSlug);
      look = { a: p?.color ?? PALETTE.amber, b: PALETTE.ice, density: 15, strength: 1.0 };
    } else look = LOOKS[scene.mood];
    targets.a.set(look.a);
    targets.b.set(look.b);
    const k = 1 - Math.exp(-dt * 2.2);
    (u.uA.value as Color).lerp(targets.a, k);
    (u.uB.value as Color).lerp(targets.b, k);
    u.uDensity.value += (look.density - u.uDensity.value) * k;
    u.uStrength.value += (look.strength - u.uStrength.value) * k;
  });
  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={-100} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
