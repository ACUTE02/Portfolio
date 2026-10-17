// The one persistent canvas: a mesh of nodes and threads that re-arranges itself for each chapter of the page.
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, LineSegments, Points, ShaderMaterial, Vector2 } from "three";
import { buildEdges, buildLayout, STAGES } from "./layouts";
import { live } from "./live";

const ATTRS = ["aT0", "aT1", "aT2", "aT3", "aT4", "aT5"];

const VERT = /* glsl */ `
  attribute vec3 aT0; attribute vec3 aT1; attribute vec3 aT2; attribute vec3 aT3; attribute vec3 aT4; attribute vec3 aT5;
  attribute float aSeed; attribute float aKind;
  uniform float uStage; uniform float uTime; uniform vec2 uPointer; uniform float uSize; uniform float uPixel; uniform float uDrift;
  varying float vKind; varying float vGlow;
  void main() {
    vec3 T[6] = vec3[6](aT0, aT1, aT2, aT3, aT4, aT5);
    float s = clamp(floor(uStage), 0.0, 4.0);
    float f = clamp(uStage - s, 0.0, 1.0);
    // each node leaves a little earlier or later than its neighbours, so the move reads as a pour, not a slide
    float g = clamp((f * 1.5 - aSeed * 0.5), 0.0, 1.0);
    g = g * g * (3.0 - 2.0 * g);
    int i0 = int(s);
    vec3 p = mix(T[i0], T[i0 + 1], g);
    float t = uTime * 0.35 + aSeed * 40.0;
    p += uDrift * vec3(sin(t * 1.3), cos(t * 1.1), sin(t * 0.9)) * 0.09;
    p.xy += uPointer * (0.35 + aSeed * 0.5) * uDrift;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (0.55 + aSeed * 0.9) * (9.0 / -mv.z);
    vKind = aKind;
    vGlow = 0.55 + 0.45 * sin(uTime * 0.8 + aSeed * 30.0) * uDrift;
  }
`;
const FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uD;
  varying float vKind; varying float vGlow;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    vec3 col = vKind < 0.25 ? uA : vKind < 0.5 ? uB : vKind < 0.75 ? uC : uD;
    float a = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(col * (0.7 + vGlow * 0.6), a * 0.9);
  }
`;
const LINE_VERT = /* glsl */ `
  attribute vec3 aT0; attribute vec3 aT1; attribute vec3 aT2; attribute vec3 aT3; attribute vec3 aT4; attribute vec3 aT5;
  attribute float aSeed;
  uniform float uStage; uniform float uTime; uniform vec2 uPointer; uniform float uDrift;
  void main() {
    vec3 T[6] = vec3[6](aT0, aT1, aT2, aT3, aT4, aT5);
    float s = clamp(floor(uStage), 0.0, 4.0);
    float f = clamp(uStage - s, 0.0, 1.0);
    float g = clamp((f * 1.5 - aSeed * 0.5), 0.0, 1.0);
    g = g * g * (3.0 - 2.0 * g);
    int i0 = int(s);
    vec3 p = mix(T[i0], T[i0 + 1], g);
    float t = uTime * 0.35 + aSeed * 40.0;
    p += uDrift * vec3(sin(t * 1.3), cos(t * 1.1), sin(t * 0.9)) * 0.09;
    p.xy += uPointer * (0.35 + aSeed * 0.5) * uDrift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const LINE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uThread; uniform float uAlpha;
  void main() { gl_FragColor = vec4(uThread, uAlpha); }
`;

function Mesh({ count }: { count: number }) {
  const rig = useMemo(() => {
    const layout = buildLayout(count);
    const points = new BufferGeometry();
    points.setAttribute("position", new BufferAttribute(layout.targets[0], 3));
    layout.targets.forEach((t, i) => points.setAttribute(ATTRS[i], new BufferAttribute(t, 3)));
    points.setAttribute("aSeed", new BufferAttribute(layout.seed, 1));
    points.setAttribute("aKind", new BufferAttribute(layout.kind, 1));
    const lines = new BufferGeometry();
    for (const [name, attr] of Object.entries(points.attributes)) lines.setAttribute(name, attr);
    lines.setIndex(new BufferAttribute(buildEdges(count), 1));
    const shared = { uStage: { value: 0 }, uTime: { value: 0 }, uPointer: { value: new Vector2() }, uDrift: { value: 1 } };
    const pointMat = new ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: {
        ...shared, uSize: { value: 5.2 }, uPixel: { value: 1 },
        uA: { value: new Color("#f2b95a") }, uB: { value: new Color("#6fd3c4") }, uC: { value: new Color("#e3a3d6") }, uD: { value: new Color("#8fb4e8") },
      },
    });
    const lineMat = new ShaderMaterial({
      vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: { ...shared, uThread: { value: new Color("#8fa3bd") }, uAlpha: { value: 0.16 } },
    });
    return { shared, pointMat, lineMat, pointsObj: new Points(points, pointMat), linesObj: new LineSegments(lines, lineMat), points, lines };
  }, [count]);

  useEffect(
    () => () => {
      rig.points.dispose();
      rig.lines.dispose();
      rig.pointMat.dispose();
      rig.lineMat.dispose();
    },
    [rig],
  );

  useFrame((state, dt) => {
    const k = live.reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    live.smooth += (live.stage - live.smooth) * k;
    const { shared, pointMat } = rig;
    shared.uStage.value = Math.min(STAGES - 1.0001, Math.max(0, live.smooth));
    shared.uTime.value = live.reduced ? 4 : state.clock.elapsedTime;
    shared.uDrift.value = live.reduced ? 0 : 1;
    shared.uPointer.value.set(live.reduced ? 0 : live.px * 0.5, live.reduced ? 0 : live.py * 0.3);
    pointMat.uniforms.uPixel.value = state.gl.getPixelRatio();
    state.camera.position.z = 11.5 - Math.min(live.smooth, 5) * 0.2;
    state.camera.lookAt(0, 0, 0);
    if (Math.abs(live.stage - live.smooth) > 1 / 400) state.invalidate();
  });

  return (
    <group>
      <primitive object={rig.linesObj} frustumCulled={false} />
      <primitive object={rig.pointsObj} frustumCulled={false} />
    </group>
  );
}

export default function Scene({ count }: { count: number }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={live.reduced ? "demand" : "always"}
      camera={{ position: [0, 0, 11.5], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0 }}
      aria-hidden="true"
    >
      <Mesh count={count} />
    </Canvas>
  );
}
