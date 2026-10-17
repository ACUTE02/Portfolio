// The one persistent canvas. It is mounted once and never unmounts: pages only change what it shows and where the camera is.
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
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

function Rig({ onSlow, onFast }: { onSlow: () => void; onFast: () => void }) {
  const acc = useRef({ t: 0, n: 0, slow: 0, calm: 0 });
  useFrame((state, dt) => {
    const pose = POSES[scene.mood];
    const k = 1 - Math.exp(-dt * 2.6);
    state.camera.position.z += (pose.z - state.camera.position.z) * k;
    state.camera.position.y += (pose.y - state.camera.position.y) * k;
    state.camera.position.x += (scene.px * 0.25 - state.camera.position.x) * 0.05;
    state.camera.lookAt(0, 0, 0);
    // a small governor: if frames stay slow for two seconds, step the quality down once; if they stay quick, up
    const a = acc.current;
    a.t += dt;
    a.n += 1;
    if (a.t > 2) {
      const ms = (a.t / a.n) * 1000;
      if (ms > 26) { a.slow++; a.calm = 0; if (a.slow >= 2) { onSlow(); a.slow = 0; } }
      else if (ms < 17) { a.calm++; a.slow = 0; if (a.calm >= 4) { onFast(); a.calm = 0; } }
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

export default function SceneRoot() {
  const [dpr, setDpr] = useState<number>(Math.min(window.devicePixelRatio, scene.lowPower ? 1 : 1.75));
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0 }}
      aria-hidden="true"
    >
      <Rig onSlow={() => setDpr((d) => Math.max(1, d - 0.25))} onFast={() => setDpr((d) => Math.min(scene.lowPower ? 1 : 1.75, d + 0.25))} />
      <Background />
      <ambientLight intensity={0.55} />
      <directionalLight color="#f2b95a" intensity={1.2} position={[3, 4, 5]} />
      <HomeObject />
      <Carousel />
      <StackGraph />
      <JourneyObject />
      <LabWall />
      <ContactObject />
    </Canvas>
  );
}
