// The hero object of each page. Every one lives in the same persistent canvas and is shown by scaling it in and out.
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, InstancedMesh, Object3D, Sprite, Vector3,
  type Group, type Mesh,
} from "three";
import { PROJECTS } from "../data/projects";
import { GROUPS, LINKS, SKILLS } from "../data/stack";
import { JOURNEY } from "../data/journey";
import { labelTexture } from "../lib/labels";
import { PALETTE } from "../lib/palette";
import { scene, type Mood } from "../lib/store";
import { Motif } from "./motifs";

const T = (c: { elapsedTime: number }) => c.elapsedTime * (scene.reduced ? 0.2 : 1);
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

/** Scale a group toward 1 when its page is active and toward 0 when not, and hide it once it has vanished. */
function useReveal(ref: React.RefObject<Group | null>, active: () => boolean, size = 1) {
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = active() ? size : 0;
    const s = damp(g.scale.x, target, 4, dt);
    g.scale.setScalar(s);
    g.visible = s > 0.01;
  });
}

/** Where a page's object sits: to the right of the text on a wide screen, above it on a narrow one. */
function place(g: Group | null, wide: number, narrow: number, dt: number, y = 0) {
  if (!g) return;
  const narrowScreen = window.innerWidth < 900;
  const x = narrowScreen ? 0 : wide;
  const yy = narrowScreen ? narrow : y;
  g.position.x = damp(g.position.x, x, 4, dt);
  g.position.y = damp(g.position.y, yy, 4, dt);
}

const moods = (...m: Mood[]) => () => m.includes(scene.mood);
const TOKEN_COLORS = [PALETTE.amber, PALETTE.teal, PALETTE.rose, PALETTE.ice].map((c) => new Color(c));

/* ------------------------------------------------------------------ Home: a knot of threads, nodes along it, a ring of tokens */
export function HomeObject() {
  const g = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const tokens = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const colored = useRef(false);
  const { nodes, strands } = useMemo(() => {
    const knot = (t: number, p = 2, q = 3) => {
      const r = 1.2 + 0.5 * Math.cos(q * t);
      return new Vector3(r * Math.cos(p * t) * 1.25, r * Math.sin(p * t) * 1.25, 0.8 * Math.sin(q * t));
    };
    const N = 520;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = knot((i / N) * Math.PI * 2);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const nodesGeo = new BufferGeometry();
    nodesGeo.setAttribute("position", new BufferAttribute(pos, 3));
    const strand = (off: number) => {
      const pts: Vector3[] = [];
      for (let i = 0; i <= 240; i++) {
        const t = (i / 240) * Math.PI * 2;
        const v = knot(t);
        const w = knot(t + 0.01);
        const tan = w.clone().sub(v).normalize();
        const side = new Vector3(0, 0, 1).cross(tan).normalize();
        pts.push(v.add(side.multiplyScalar(Math.sin(t * 6 + off) * 0.16)).add(new Vector3(0, 0, Math.cos(t * 6 + off) * 0.16)));
      }
      return new BufferGeometry().setFromPoints(new CatmullRomCurve3(pts, true).getPoints(480));
    };
    return { nodes: nodesGeo, strands: [strand(0), strand(2.1), strand(4.2)] };
  }, []);
  useReveal(g, moods("home"), 1.12);
  useFrame((s, dt) => {
    if (!g.current?.visible) return;
    const t = T(s.clock);
    place(g.current, 2.6, 2.9, dt, 0.1);
    if (inner.current) {
      inner.current.rotation.y = t * 0.22 + scene.px * 0.4;
      inner.current.rotation.x = -scene.py * 0.25 + Math.sin(t * 0.3) * 0.08;
    }
    const m = tokens.current;
    if (m) {
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + t * 0.25;
        dummy.position.set(Math.cos(a) * 2.7, Math.sin(a * 2) * 0.25, Math.sin(a) * 2.7);
        dummy.rotation.set(t + i, t * 0.6, 0);
        dummy.scale.setScalar(0.08 + (i % 3) * 0.03);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        if (!colored.current) m.setColorAt(i, TOKEN_COLORS[i % 4]);
      }
      m.instanceMatrix.needsUpdate = true;
      if (!colored.current && m.instanceColor) {
        m.instanceColor.needsUpdate = true;
        colored.current = true;
      }
    }
  });
  return (
    <group ref={g} visible={false}>
      <group ref={inner}>
        {strands.map((geo, i) => (
          <line key={i}>
            <primitive object={geo} attach="geometry" />
            <lineBasicMaterial color={[PALETTE.amber, PALETTE.ice, PALETTE.rose][i]} transparent opacity={0.75} />
          </line>
        ))}
        <points geometry={nodes}>
          <pointsMaterial color={PALETTE.text} size={0.045} sizeAttenuation transparent opacity={0.9} />
        </points>
      </group>
      <instancedMesh ref={tokens} args={[undefined, undefined, 18]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial emissiveIntensity={0.6} emissive={PALETTE.amber} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Projects: a ring of the project objects */
export function Carousel() {
  const g = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const items = useRef<(Group | null)[]>([]);
  const N = PROJECTS.length;
  const step = (Math.PI * 2) / N;
  const rot = useRef(0);
  const [mounted, setMounted] = useState<boolean[]>(() => Array(PROJECTS.length).fill(false));
  const mountedKey = useRef("");
  useReveal(g, moods("projects", "detail"));
  const want: boolean[] = useMemo(() => Array(PROJECTS.length).fill(false), []);
  useFrame((_, dt) => {
    if (!g.current?.visible && mountedKey.current !== "" && !mountedKey.current.includes("1")) return; // hidden and already unmounted: nothing to do
    const detail = scene.mood === "detail";
    const wanted = detail ? PROJECTS.findIndex((p) => p.slug === scene.activeSlug) : scene.carouselTarget;
    // take the shortest way round
    let diff = wanted - rot.current;
    diff = ((((diff + N / 2) % N) + N) % N) - N / 2;
    rot.current += diff * (1 - Math.exp(-dt * 4.5));
    const radius = window.innerWidth < 900 ? 4.2 : 5.6;
    if (ring.current) {
      ring.current.rotation.y = -rot.current * step;
      ring.current.position.z = -radius; // the ring turns about its own centre, which sits behind the front item
    }
    items.current.forEach((it, i) => {
      if (!it) return;
      const a = i * step;
      const front = Math.abs((((i - rot.current + N / 2) % N) + N) % N - N / 2);
      it.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius);
      it.rotation.y = a + rot.current * 0 ;
      // the front project is large, its neighbours small, and the far side of the ring is not drawn at all
      const target = detail ? (front < 0.5 ? 1.2 : 0) : front < 0.5 ? 0.95 : front < 1.5 ? 0.4 : front < 2.6 ? 0.24 : 0;
      it.scale.setScalar(damp(it.scale.x, target, 5, dt));
      it.visible = it.scale.x > 0.02;
      want[i] = !!g.current?.visible && (detail ? front < 0.8 : front < 3.6); // a little ahead of the visible range
    });
    const key = want.map((x) => (x ? "1" : "0")).join("");
    if (key !== mountedKey.current) {
      mountedKey.current = key;
      setMounted([...want]);
    }
    if (g.current) {
      const narrow = window.innerWidth < 900;
      g.current.position.x = damp(g.current.position.x, detail && !narrow ? 2.5 : 0, 4, dt);
      g.current.position.y = damp(g.current.position.y, detail && narrow ? 1.5 : detail ? 0 : narrow ? 1.6 : 0.7, 4, dt);
      g.current.position.z = damp(g.current.position.z, detail ? 0 : radius * 0.55, 4, dt);
    }
  });
  return (
    <group ref={g} visible={false}>
      <group ref={ring}>
        {PROJECTS.map((p, i) => (
          <group key={p.slug} ref={(el) => { items.current[i] = el; }}>
            <group rotation={[0.38, 0, 0]}>
              {mounted[i] && <Motif id={p.motif} color={p.color} />}
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ Stack: skills as a graph, joined where they are used together */
export function StackGraph() {
  const g = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const hl = useRef<BufferGeometry>(null);
  const sprites = useRef<Record<string, Sprite | null>>({});
  const spheres = useRef<Record<string, Mesh | null>>({});
  const { pos, groupColor } = useMemo(() => {
    const gc: Record<string, string> = {};
    GROUPS.forEach((x) => (gc[x.id] = x.color));
    const p: Record<string, Vector3> = {};
    GROUPS.forEach((grp, gi) => {
      const y = 1 - (2 * (gi + 0.5)) / GROUPS.length;
      const r = Math.sqrt(1 - y * y);
      const th = gi * Math.PI * (3 - Math.sqrt(5));
      const center = new Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(2.15);
      const mem = SKILLS.filter((s) => s.group === grp.id);
      mem.forEach((s, i) => {
        const a = (i / mem.length) * Math.PI * 2;
        const off = new Vector3(Math.cos(a) * 0.7, Math.sin(a * 1.7) * 0.5, Math.sin(a) * 0.7);
        p[s.id] = center.clone().add(off);
      });
    });
    return { pos: p, groupColor: gc };
  }, []);
  const nbr = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const [a, b] of LINKS) {
      (m[a] ??= new Set()).add(b);
      (m[b] ??= new Set()).add(a);
    }
    return m;
  }, []);
  const baseLines = useMemo(() => {
    const arr: number[] = [];
    for (const [a, b] of LINKS) if (pos[a] && pos[b]) arr.push(...pos[a].toArray(), ...pos[b].toArray());
    return new Float32Array(arr);
  }, [pos]);
  const setHover = (id: string | null) => {
    scene.hover = id;
    window.dispatchEvent(new CustomEvent("skill-hover", { detail: id }));
    const geo = hl.current;
    if (!geo) return;
    const arr: number[] = [];
    if (id) for (const [a, b] of LINKS) if ((a === id || b === id) && pos[a] && pos[b]) arr.push(...pos[a].toArray(), ...pos[b].toArray());
    geo.setAttribute("position", new BufferAttribute(new Float32Array(arr), 3));
  };
  useEffect(() => {
    const onHover = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      if (id !== scene.hover) setHover(id);
    };
    window.addEventListener("skill-hover-dom", onHover);
    return () => window.removeEventListener("skill-hover-dom", onHover);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useReveal(g, moods("stack"), 0.7);
  useFrame((s, dt) => {
    if (!g.current?.visible) return;
    place(g.current, 2.4, 2.4, dt, 0);
    if (spin.current && !scene.hover) spin.current.rotation.y += dt * (scene.reduced ? 0.02 : 0.12);
    if (spin.current) spin.current.rotation.x = damp(spin.current.rotation.x, -scene.py * 0.25, 3, dt);
    const t = T(s.clock);
    for (const sk of SKILLS) {
      const m = spheres.current[sk.id];
      if (!m) continue;
      const on = scene.hover === sk.id || (scene.hover !== null && nbr[scene.hover]?.has(sk.id));
      const target = on ? 1.9 : scene.hover ? 0.7 : 1;
      m.scale.setScalar(damp(m.scale.x, target, 8, dt) * (1 + Math.sin(t * 2 + sk.id.length) * 0.02));
    }
    // labels always face the camera because they are sprites; fade the ones not involved while one skill is hovered
    for (const sk of SKILLS) {
      const sp = sprites.current[sk.id];
      if (!sp) continue;
      const on = !scene.hover || scene.hover === sk.id || nbr[scene.hover]?.has(sk.id);
      (sp.material as unknown as { opacity: number }).opacity = damp((sp.material as unknown as { opacity: number }).opacity, on ? 1 : 0.18, 8, dt);
    }
  });
  return (
    <group ref={g} visible={false}>
      <group ref={spin}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[baseLines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={PALETTE.ice} transparent opacity={0.55} />
        </lineSegments>
        <lineSegments>
          <bufferGeometry ref={hl} />
          <lineBasicMaterial color={PALETTE.amber} />
        </lineSegments>
        {SKILLS.map((sk) => {
          const p = pos[sk.id];
          const tex = labelTexture(sk.id, "#eef2f7", 40);
          const aspect = (tex.userData as { aspect: number }).aspect;
          return (
            <group key={sk.id} position={p}>
              <mesh
                ref={(m) => { spheres.current[sk.id] = m; }}
                onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(sk.id); }}
                onPointerOut={() => setHover(null)}
              >
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color={groupColor[sk.group]} emissive={groupColor[sk.group]} emissiveIntensity={0.7} />
              </mesh>
              <sprite ref={(sp) => { sprites.current[sk.id] = sp; }} position={[0, 0.2, 0]} scale={[0.2 * aspect * 1.2, 0.2 * 1.2, 1]}>
                <spriteMaterial map={tex} transparent depthWrite={false} />
              </sprite>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ Journey: a spiral staircase of milestones */
const KIND_COLOR = { education: PALETTE.amber, experience: PALETTE.teal, cert: PALETTE.ice, hackathon: PALETTE.rose } as const;
export function JourneyObject() {
  const g = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const discs = useRef<(Mesh | null)[]>([]);
  useReveal(g, moods("journey"), 1);
  useFrame((s, dt) => {
    if (!g.current?.visible) return;
    const t = T(s.clock);
    place(g.current, 2.6, 2.7, dt, -0.2);
    if (spin.current) spin.current.rotation.y = t * 0.2 + scene.px * 0.3;
    discs.current.forEach((d, i) => {
      if (!d) return;
      d.position.y = -1.6 + i * 0.55 + Math.sin(t * 1.2 + i) * 0.03;
      const last = i === JOURNEY.length - 1;
      d.scale.setScalar(1 + (last ? Math.sin(t * 2.2) * 0.08 : 0));
    });
  });
  return (
    <group ref={g} visible={false}>
      <group ref={spin}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 4.4, 6]} />
          <meshBasicMaterial color={PALETTE.ice} transparent opacity={0.5} />
        </mesh>
        {JOURNEY.map((m, i) => {
          const a = i * 1.15;
          return (
            <group key={m.id} position={[Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35]} rotation={[0, -a, 0]}>
              <mesh ref={(d) => { discs.current[i] = d; }}>
                <cylinderGeometry args={[0.46, 0.46, 0.09, 36]} />
                <meshStandardMaterial color={KIND_COLOR[m.kind]} emissive={KIND_COLOR[m.kind]} emissiveIntensity={0.5} />
              </mesh>
            </group>
          );
        })}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.35, 0.01, 6, 80]} />
          <meshBasicMaterial color={PALETTE.ice} transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ Lab: every repository as a column, newest tallest */
const LANG_COLOR: Record<string, string> = { Python: PALETTE.amber, TypeScript: PALETTE.ice, JavaScript: PALETTE.teal, "Jupyter Notebook": PALETTE.rose, Java: "#ff9d86", "C#": "#b9c3d0" };
export function LabWall() {
  const g = useRef<Group>(null);
  const cols = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const prepared = useRef<{ src: unknown; base: Float32Array } | null>(null);
  useReveal(g, moods("lab"), 1);
  useFrame((s, dt) => {
    if (!g.current?.visible) return;
    const t = T(s.clock);
    place(g.current, 2.2, 2.6, dt, -0.3);
    const m = cols.current;
    if (!m) return;
    const repos = scene.repos;
    const n = Math.min(repos.length, 64);
    m.count = n;
    const per = 8;
    const fresh = prepared.current?.src !== repos;
    if (fresh) {
      const now = Date.now();
      const base = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const r = repos[i];
        const age = r.updated ? (now - new Date(r.updated).getTime()) / 864e5 : 90;
        base[i] = 0.35 + Math.max(0, 1 - age / 120) * 1.1 + Math.min(r.stars, 8) * 0.05;
        m.setColorAt(i, color.set(LANG_COLOR[r.language ?? ""] ?? "#6b7a8c"));
      }
      prepared.current = { src: repos, base };
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    const bases = prepared.current!.base;
    for (let i = 0; i < n; i++) {
      const h = bases[i] * (1 + Math.sin(t * 1.3 + i * 0.7) * 0.05);
      const x = (i % per) - (per - 1) / 2;
      const z = Math.floor(i / per) - 3;
      dummy.position.set(x * 0.52, h / 2 - 0.9, z * 0.52);
      dummy.scale.set(0.38, h, 0.38);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (g.current) {
      g.current.rotation.y = damp(g.current.rotation.y, -0.7 + scene.px * 0.2, 3, dt);
      g.current.rotation.x = 0.5;
    }
  });
  return (
    <group ref={g} visible={false}>
      <instancedMesh ref={cols} args={[undefined, undefined, 64]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial emissive={PALETTE.ink} emissiveIntensity={0.1} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Contact: a beacon, and a paper plane that leaves when you write */
export function ContactObject() {
  const g = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const plane = useRef<Group>(null);
  const planeGeo = useMemo(() => {
    const geo = new BufferGeometry();
    // a folded paper plane: two wings and a keel
    const v = new Float32Array([
      0, 0, 0.9, -0.55, 0.08, -0.5, 0, -0.12, -0.35,
      0, 0, 0.9, 0.55, 0.08, -0.5, 0, -0.12, -0.35,
      0, 0, 0.9, -0.55, 0.08, -0.5, 0, 0.05, -0.2,
      0, 0, 0.9, 0.55, 0.08, -0.5, 0, 0.05, -0.2,
    ]);
    geo.setAttribute("position", new BufferAttribute(v, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);
  useReveal(g, moods("contact", "lost"), 1);
  useFrame((s, dt) => {
    if (!g.current?.visible) return;
    const t = T(s.clock);
    place(g.current, 2.6, 2.6, dt, 0);
    rings.current?.children.forEach((c, i) => {
      const u = ((t * 0.35 + i / 4) % 1);
      c.scale.setScalar(0.3 + u * 2.6);
      ((c as Mesh).material as unknown as { opacity: number }).opacity = (1 - u) * 0.55;
    });
    const p = plane.current;
    if (!p) return;
    if (scene.sendAt === -2) scene.sendAt = s.clock.elapsedTime; // the page asked for a launch
    const since = scene.sendAt < 0 ? -1 : s.clock.elapsedTime - scene.sendAt;
    if (since >= 0 && since < 2.4) {
      const u = since / 2.4; // flies off up and to the right, then returns idle
      p.position.set(1 + u * 9, 0.4 + u * 4.5, -u * 2);
      p.rotation.set(-0.4, -1.2 + u * 0.4, -0.5);
    } else {
      p.position.set(Math.cos(t * 0.6) * 1.9, Math.sin(t * 0.9) * 0.35 + 0.2, Math.sin(t * 0.6) * 1.2);
      p.rotation.set(0.15, -t * 0.6 + Math.PI / 2, Math.sin(t * 0.9) * 0.25);
    }
    p.visible = scene.mood === "contact" || scene.mood === "lost";
  });
  return (
    <group ref={g} visible={false}>
      <group ref={rings} rotation={[Math.PI / 2.2, 0, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i}>
            <torusGeometry args={[1, 0.012, 6, 80]} />
            <meshBasicMaterial color={PALETTE.teal} transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={PALETTE.amber} />
      </mesh>
      <group ref={plane}>
        <mesh geometry={planeGeo}>
          <meshStandardMaterial color={PALETTE.text} emissive={PALETTE.ice} emissiveIntensity={0.25} side={DoubleSide} flatShading />
        </mesh>
      </group>
    </group>
  );
}
