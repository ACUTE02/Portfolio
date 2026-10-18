// One small 3D object per project, built from primitives, each drawing what the project actually does.
// Every motif fits a sphere of radius ~1.6 around its own origin and animates itself in useFrame.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, IcosahedronGeometry, InstancedMesh, Object3D, Vector3,
  type Group, type Mesh, type Points,
} from "three";
import type { MotifId } from "../data/projects";
import { PALETTE } from "../lib/palette";
import { scene } from "../lib/store";

const T = (clock: { elapsedTime: number }) => clock.elapsedTime * (scene.reduced ? 0.2 : 1);
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// The scene has a fixed set of lights (see SceneRoot). Lights that come and go would make every material recompile
// each time a page changes, which is a visible hitch, so the motifs rely on their own emissive colour instead.
function Glow(_props: { color: string; intensity?: number }) {
  return null;
}

/* ------------------------------------------------------------------ TrustMesh: a graph, a waveform ring, and a hollow slot */
function TrustMesh({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const bars = useRef<InstancedMesh>(null);
  const ico = useMemo(() => new IcosahedronGeometry(0.95, 1), []);
  const dummy = useMemo(() => new Object3D(), []);
  const N = 56;
  useFrame((s) => {
    const t = T(s.clock);
    if (g.current) g.current.rotation.y = t * 0.35;
    const m = bars.current;
    if (!m) return;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const h = 0.12 + Math.abs(Math.sin(a * 3 + t * 2.2)) * 0.5 * (0.6 + 0.4 * Math.sin(a * 7 - t));
      dummy.position.set(Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5);
      dummy.rotation.set(0, -a, 0);
      dummy.scale.set(0.05, h, 0.05);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <Glow color={color} />
      <group ref={g}>
        <lineSegments>
          <edgesGeometry args={[ico]} />
          <lineBasicMaterial color={PALETTE.ice} transparent opacity={0.8} />
        </lineSegments>
        <points>
          <primitive object={ico} attach="geometry" />
          <pointsMaterial color={color} size={0.09} sizeAttenuation />
        </points>
      </group>
      <instancedMesh ref={bars} args={[undefined, undefined, N]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={PALETTE.rose} emissive={PALETTE.rose} emissiveIntensity={0.5} />
      </instancedMesh>
      {/* the hollow dashed ring: the Visual Engine, designed and not built */}
      <mesh rotation={[1.2, 0.3, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[1.95, 0.012, 6, 90]} />
        <meshBasicMaterial color="#b9c3d0" transparent opacity={0.55} wireframe />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Climate: a banded globe and six agents */
function Climate({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const agents = useRef<Group>(null);
  useFrame((s) => {
    const t = T(s.clock);
    if (g.current) g.current.rotation.y = t * 0.25;
    if (agents.current) agents.current.rotation.y = -t * 0.6;
  });
  const bands = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ y: -0.75 + i * 0.25, c: new Color(PALETTE.ice).lerp(new Color(PALETTE.amber), i / 6) })), []);
  return (
    <group>
      <Glow color={color} />
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[0.95, 22, 16]} />
          <meshBasicMaterial color={PALETTE.ice} wireframe transparent opacity={0.28} />
        </mesh>
        {bands.map((b, i) => {
          const r = Math.sqrt(Math.max(0.0001, 0.95 * 0.95 - b.y * b.y));
          return (
            <mesh key={i} position={[0, b.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.022, 6, 64]} />
              <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={0.7} />
            </mesh>
          );
        })}
      </group>
      <group ref={agents}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const p = new Vector3(Math.cos(a) * 1.55, Math.sin(a * 2) * 0.35, Math.sin(a) * 1.55);
          return (
            <group key={i}>
              <mesh position={p}>
                <octahedronGeometry args={[0.14, 0]} />
                <meshStandardMaterial color={i === 5 ? PALETTE.amber : color} emissive={color} emissiveIntensity={0.6} />
              </mesh>
              <line>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, 0, p.x, p.y, p.z]), 3]} />
                </bufferGeometry>
                <lineBasicMaterial color={color} transparent opacity={0.4} />
              </line>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ Grow Vyaapar: eight shops, a hub, seven agents */
function Vyaapar({ color }: { color: string }) {
  const rings = useRef<Group>(null);
  const shops = useRef<Group>(null);
  useFrame((s) => {
    const t = T(s.clock);
    if (shops.current) shops.current.rotation.y = t * 0.2;
    rings.current?.children.forEach((c, i) => {
      c.rotation.x = t * (0.3 + i * 0.07) + i;
      c.rotation.y = t * (0.2 + i * 0.05);
    });
  });
  const cols = [PALETTE.amber, PALETTE.teal, PALETTE.rose, PALETTE.ice];
  return (
    <group>
      <Glow color={color} />
      <mesh>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      <group ref={shops}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.3, 0.3 + (i % 3) * 0.08, 0.3]} />
              <meshStandardMaterial color={cols[i % 4]} emissive={cols[i % 4]} emissiveIntensity={0.35} />
            </mesh>
          );
        })}
      </group>
      <group ref={rings}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i}>
            <torusGeometry args={[0.8 + i * 0.07, 0.008, 6, 72]} />
            <meshBasicMaterial color={PALETTE.ice} transparent opacity={0.65} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ Adaptive learning: the forgetting curve, reset by reviews */
function Adaptive({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const dot = useRef<Mesh>(null);
  const curve = useMemo(() => {
    const pts: Vector3[] = [];
    const reviews = [0, 0.9, 1.9, 3.1];
    for (let x = 0; x <= 4.4; x += 0.06) {
      const last = [...reviews].reverse().find((r) => r <= x) ?? 0;
      const idx = reviews.indexOf(last);
      const decay = 0.9 + idx * 0.6; // each review makes the memory last longer
      pts.push(new Vector3(x - 2.2, Math.exp(-(x - last) / decay) * 1.5 - 0.75, 0));
    }
    return new CatmullRomCurve3(pts);
  }, []);
  useFrame((s) => {
    const t = T(s.clock);
    if (g.current) g.current.rotation.y = Math.sin(t * 0.4) * 0.5;
    if (dot.current) dot.current.position.copy(curve.getPoint((t * 0.12) % 1));
  });
  return (
    <group ref={g}>
      <Glow color={color} />
      <mesh>
        <tubeGeometry args={[curve, 200, 0.03, 6, false]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={dot}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={PALETTE.amber} />
      </mesh>
      {[0, 0.9, 1.9, 3.1].map((r, i) => (
        <mesh key={i} position={[r - 2.2, -0.9, 0]}>
          <boxGeometry args={[0.38, 0.05, 0.5]} />
          <meshStandardMaterial color={PALETTE.rose} emissive={PALETTE.rose} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <gridHelper args={[4.6, 8, PALETTE.ice, PALETTE.ice]} position={[0, -0.95, 0]} rotation={[0, 0, 0]} />
    </group>
  );
}

/* ------------------------------------------------------------------ Climate SLM: layers, with a low-rank adapter slid in */
function Slm({ color }: { color: string }) {
  const adapter = useRef<Group>(null);
  const g = useRef<Group>(null);
  useFrame((s) => {
    const t = T(s.clock);
    if (g.current) g.current.rotation.y = t * 0.3;
    if (adapter.current) adapter.current.position.x = 1.05 + Math.sin(t * 0.9) * 0.18;
  });
  return (
    <group ref={g}>
      <Glow color={color} />
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, -0.9 + i * 0.3, 0]}>
          <boxGeometry args={[1.7, 0.1, 1.2]} />
          <meshStandardMaterial color={PALETTE.ice} transparent opacity={0.55} emissive={PALETTE.ice} emissiveIntensity={0.15} />
        </mesh>
      ))}
      <group ref={adapter} position={[1.05, 0, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.18, 0.1, 1.0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.1, 1.0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0.34, 0.15, 0]}>
          <boxGeometry args={[0.04, 1.0, 0.04]} />
          <meshBasicMaterial color={PALETTE.amber} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ Deep Research: a lens over a stack of pages */
function Research({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const lens = useRef<Group>(null);
  useFrame((s) => {
    const t = T(s.clock);
    if (g.current) g.current.rotation.y = t * 0.25;
    if (lens.current) {
      lens.current.position.set(Math.sin(t * 0.7) * 0.7, Math.cos(t * 0.5) * 0.35, 0.7);
    }
  });
  return (
    <group ref={g}>
      <Glow color={color} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(i % 3 - 1) * 0.85, (Math.floor(i / 3) - 0.5) * 1.05, -0.2 - (i % 2) * 0.25]} rotation={[0, 0.15 * (i % 3 - 1), 0.05 * i]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshStandardMaterial color={PALETTE.text} side={DoubleSide} transparent opacity={0.8} emissive={PALETTE.ice} emissiveIntensity={0.12} />
        </mesh>
      ))}
      <group ref={lens}>
        <mesh>
          <torusGeometry args={[0.5, 0.06, 12, 40]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.55, -0.55, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
          <meshStandardMaterial color={PALETTE.amber} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ ListenList: a voice, as an equalizer */
function Voice({ color }: { color: string }) {
  const bars = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const N = 21;
  useFrame((s) => {
    const t = T(s.clock);
    const m = bars.current;
    if (!m) return;
    const talking = 0.55 + 0.45 * Math.sin(t * 0.8);
    for (let i = 0; i < N; i++) {
      const x = (i - (N - 1) / 2) * 0.14;
      const env = Math.exp(-(x * x) / 0.9);
      const h = 0.1 + env * (0.4 + 0.9 * Math.abs(Math.sin(t * 5 + i * 0.7))) * talking;
      dummy.position.set(x * 1.6, 0, 0);
      dummy.scale.set(0.1, h, 0.1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <Glow color={color} />
      <instancedMesh ref={bars} args={[undefined, undefined, N]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} />
      </instancedMesh>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.35]} />
        <meshStandardMaterial color={PALETTE.amber} emissive={PALETTE.amber} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, -0.55, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.18, 0.025, 8, 24, Math.PI]} />
        <meshBasicMaterial color={PALETTE.amber} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Stock prediction: candles and a forecast line */
function Stock({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const candles = useMemo(() => {
    const r = rng(7);
    let p = 0;
    return Array.from({ length: 15 }, (_, i) => {
      const open = p;
      p += (r() - 0.46) * 0.35;
      return { x: (i - 7) * 0.2, open, close: p, hi: Math.max(open, p) + r() * 0.12, lo: Math.min(open, p) - r() * 0.12 };
    });
  }, []);
  const forecast = useMemo(() => {
    const last = candles[candles.length - 1];
    return new CatmullRomCurve3([new Vector3(last.x, last.close, 0), new Vector3(last.x + 0.5, last.close + 0.25, 0), new Vector3(last.x + 1, last.close + 0.1, 0), new Vector3(last.x + 1.5, last.close + 0.5, 0)]);
  }, [candles]);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = Math.sin(T(s.clock) * 0.35) * 0.6;
  });
  return (
    <group ref={g} position={[-0.3, 0, 0]}>
      <Glow color={color} />
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const col = up ? PALETTE.teal : PALETTE.rose;
        return (
          <group key={i} position={[c.x, 0, 0]}>
            <mesh position={[0, (c.open + c.close) / 2, 0]}>
              <boxGeometry args={[0.1, Math.max(0.04, Math.abs(c.close - c.open)), 0.1]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, (c.hi + c.lo) / 2, 0]}>
              <boxGeometry args={[0.014, c.hi - c.lo, 0.014]} />
              <meshBasicMaterial color={col} />
            </mesh>
          </group>
        );
      })}
      <mesh>
        <tubeGeometry args={[forecast, 40, 0.018, 5, false]} />
        <meshBasicMaterial color={PALETTE.amber} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Face attendance: landmarks, a frame, a scan line */
function Face({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const scan = useRef<Mesh>(null);
  const pts = useMemo(() => {
    const a: number[] = [];
    const add = (x: number, y: number) => a.push(x, y, Math.cos(x * 1.3) * 0.12);
    for (let i = 0; i <= 16; i++) { const t = Math.PI * (0.05 + (i / 16) * 0.9); add(Math.cos(t) * 0.75, -Math.sin(t) * 1.0 + 0.15); } // jaw
    for (let i = 0; i < 5; i++) { add(-0.62 + i * 0.12, 0.62 + Math.sin(i * 0.8) * 0.06); add(0.14 + i * 0.12, 0.62 + Math.sin((4 - i) * 0.8) * 0.06); } // brows
    for (let i = 0; i < 6; i++) { const t = (i / 6) * Math.PI * 2; add(-0.32 + Math.cos(t) * 0.12, 0.38 + Math.sin(t) * 0.06); add(0.32 + Math.cos(t) * 0.12, 0.38 + Math.sin(t) * 0.06); } // eyes
    for (let i = 0; i < 9; i++) add(((i % 5) - 2) * 0.07, 0.2 - Math.floor(i / 5) * -0.0 - i * 0.045); // nose
    for (let i = 0; i < 20; i++) { const t = (i / 20) * Math.PI * 2; add(Math.cos(t) * 0.28, -0.42 + Math.sin(t) * 0.1); } // mouth
    return new Float32Array(a);
  }, []);
  const geo = useMemo(() => {
    const gg = new BufferGeometry();
    gg.setAttribute("position", new BufferAttribute(pts, 3));
    return gg;
  }, [pts]);
  useFrame((s) => {
    const t = T(s.clock);
    if (g.current) g.current.rotation.y = Math.sin(t * 0.5) * 0.55;
    if (scan.current) scan.current.position.y = Math.sin(t * 1.4) * 1.0;
  });
  return (
    <group ref={g}>
      <Glow color={color} />
      <points geometry={geo as BufferGeometry} {...({} as object)}>
        <pointsMaterial color={color} size={0.07} />
      </points>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.0, 2.4, 0.02]} />
        <meshBasicMaterial color={PALETTE.ice} wireframe transparent opacity={0.4} />
      </mesh>
      <mesh ref={scan}>
        <planeGeometry args={[2.0, 0.04]} />
        <meshBasicMaterial color={PALETTE.amber} transparent opacity={0.85} side={DoubleSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Posture: a skeleton that slouches, and an alert */
function Posture({ color }: { color: string }) {
  const g = useRef<Group>(null);
  const head = useRef<Group>(null);
  const alert = useRef<Mesh>(null);
  const J: [number, number][] = [[0, 0.1], [0, -0.35], [0, -0.7], [0.0, -1.05], [0.05, -1.4]]; // neck, shoulder, chest, waist, hip (side view)
  useFrame((s) => {
    const t = T(s.clock);
    const slouch = Math.max(0, Math.sin(t * 0.8)); // 0 = upright, 1 = slouching
    if (g.current) g.current.rotation.y = 0.5 + Math.sin(t * 0.3) * 0.2;
    if (head.current) {
      head.current.position.set(slouch * 0.45, 0.62 - slouch * 0.18, 0);
      head.current.rotation.z = -slouch * 0.5;
    }
    if (alert.current) {
      const m = alert.current.material as unknown as { color: Color; opacity: number };
      m.color.set(slouch > 0.6 ? PALETTE.rose : PALETTE.teal);
      m.opacity = 0.25 + slouch * 0.6;
      alert.current.scale.setScalar(1 + slouch * 0.15);
    }
  });
  return (
    <group ref={g} position={[0, 0.25, 0]}>
      <Glow color={color} />
      <group ref={head}>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </group>
      {J.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshBasicMaterial color={PALETTE.ice} />
        </mesh>
      ))}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.7, 6]} />
        <meshBasicMaterial color={PALETTE.ice} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[0.9, 0.04, 0.04]} />
        <meshBasicMaterial color={PALETTE.ice} />
      </mesh>
      <mesh ref={alert} position={[0, 0.5, 0]}>
        <torusGeometry args={[0.55, 0.02, 8, 48]} />
        <meshBasicMaterial color={PALETTE.teal} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ HelpDesk: tickets moving across three lanes */
function Helpdesk({ color }: { color: string }) {
  const tickets = useRef<Group>(null);
  useFrame((s) => {
    const t = T(s.clock);
    tickets.current?.children.forEach((c, i) => {
      const u = (t * 0.12 + i / 7) % 1;
      c.position.set(-1.5 + u * 3.0, 0.05 + (i % 3) * 0.0, (i % 3 - 1) * 0.62);
      const lane = u < 0.33 ? 0 : u < 0.66 ? 1 : 2;
      ((c as Mesh).material as unknown as { color: Color }).color.set([PALETTE.rose, PALETTE.amber, PALETTE.teal][lane]);
    });
  });
  return (
    <group rotation={[0.5, -0.5, 0]}>
      <Glow color={color} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.08, (i - 1) * 0.62]}>
          <boxGeometry args={[3.3, 0.03, 0.5]} />
          <meshStandardMaterial color={PALETTE.ice} transparent opacity={0.3} />
        </mesh>
      ))}
      <group ref={tickets}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.42, 0.06, 0.32]} />
            <meshStandardMaterial color={PALETTE.rose} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const MAP: Record<MotifId, (p: { color: string }) => React.ReactElement> = {
  trustmesh: TrustMesh, climate: Climate, vyaapar: Vyaapar, adaptive: Adaptive, slm: Slm, research: Research,
  voice: Voice, stock: Stock, face: Face, posture: Posture, helpdesk: Helpdesk,
};

export function Motif({ id, color }: { id: MotifId; color: string }) {
  const C = MAP[id];
  return <C color={color} />;
}

export type { Points };
