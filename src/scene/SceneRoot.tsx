// The one persistent canvas. It is mounted once and never unmounts: pages only change what it shows and where the camera is.
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { PALETTE } from "../lib/palette";
import { scene, type Mood } from "../lib/store";
import { Background } from "./Background";
import { Carousel, ContactObject, HomeObject, JourneyObject, LabWall, StackGraph } from "./objects";

const POSES: Record<Mood, { z: number; y: number }> = {
  home: { z: 9, y: 0 },
  projects: { z: 8.4, y: 0.9 },
  detail: { z: 7.2, y: 0.2 },
  stack: { z: 9, y: 0 },
  lab: { z: 9, y: 0.3 },
  journey: { z: 9, y: 0.2 },
  contact: { z: 9, y: 0 },
  lost: { z: 9, y: 0 },
};

// Pixel ratio: sharp on a laptop, a little lower on a phone (where every pixel costs battery), and it steps down by itself
// if frames run slow. The contour lines stay clean at every step because they are anti-aliased in the shader.
const DPR_MAX = () => (scene.lowPower || scene.isTouch ? 1.25 : 1.5);
const DPR_MIN = 0.85;

function Rig({ onSlow, onFast }: { onSlow: () => void; onFast: () => void }) {
  const acc = useRef({ t: 0, n: 0, slow: 0, calm: 0 });
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05); // a long gap (a hidden tab, a hitch) must not throw the camera
    const pose = POSES[scene.mood];
    const k = 1 - Math.exp(-d * 2.6);
    state.camera.position.z += (pose.z - state.camera.position.z) * k;
    state.camera.position.y += (pose.y - state.camera.position.y) * k;
    state.camera.position.x += (scene.px * 0.25 - state.camera.position.x) * (1 - Math.exp(-d * 3));
    state.camera.lookAt(0, 0, 0);
    // a small governor: judge over about a second and a half, ignore the first frames after a long gap
    const a = acc.current;
    if (dt < 0.25) {
      a.t += dt;
      a.n += 1;
    }
    if (a.t > 1.5) {
      const ms = (a.t / a.n) * 1000;
      if (ms > 22) { a.slow++; a.calm = 0; if (a.slow >= 2) { onSlow(); a.slow = 0; } }
      else if (ms < 15.5) { a.calm++; a.slow = 0; if (a.calm >= 5) { onFast(); a.calm = 0; } }
      else { a.slow = 0; a.calm = 0; }
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

export default function SceneRoot() {
  const [dpr, setDpr] = useState<number>(Math.min(window.devicePixelRatio, DPR_MAX()));
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false, depth: true }}
      // The page sits on top of the canvas, so pointer events are taken from the document and raycast into the scene.
      // That is what lets the skill graph react to the pointer while the text column is above it.
      eventSource={document.documentElement}
      eventPrefix="client"
      style={{ position: "fixed", inset: 0 }}
      aria-hidden="true"
    >
      <Rig onSlow={() => setDpr((d) => Math.max(DPR_MIN, d - 0.15))} onFast={() => setDpr((d) => Math.min(DPR_MAX(), d + 0.15))} />
      <Background />
      {/* A fixed set of lights. Lights must never be added or removed while the site runs: every material would be recompiled. */}
      <ambientLight intensity={0.6} />
      <directionalLight color={PALETTE.amber} intensity={1.2} position={[3, 4, 5]} />
      <pointLight color={PALETTE.amber} intensity={9} distance={12} position={[3, 2.5, 4]} />
      <pointLight color={PALETTE.ice} intensity={8} distance={12} position={[-3, 1, 4]} />
      <HomeObject />
      <Carousel />
      <StackGraph />
      <JourneyObject />
      <LabWall />
      <ContactObject />
    </Canvas>
  );
}
