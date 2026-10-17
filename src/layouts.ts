// One set of nodes, six arrangements, one per chapter. Neighbouring indices are always neighbours in space,
// so the thread drawn between index i and i+1 reads as a thread in every arrangement.
export const STAGES = 6;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

export interface Layout {
  targets: Float32Array[]; // STAGES arrays of 3 * count
  seed: Float32Array;
  kind: Float32Array; // 0..1, picks a colour
}

export function buildLayout(count: number): Layout {
  const r = rng(20261018);
  const targets = Array.from({ length: STAGES }, () => new Float32Array(count * 3));
  const seed = new Float32Array(count);
  const kind = new Float32Array(count);
  const put = (stage: number, i: number, x: number, y: number, z: number) => {
    targets[stage][i * 3] = x;
    targets[stage][i * 3 + 1] = y;
    targets[stage][i * 3 + 2] = z;
  };
  const golden = Math.PI * (3 - Math.sqrt(5));

  // Skills: 8 clusters on a ring, each an index range.
  const clusters = 8;
  const cx = (c: number) => Math.cos((c / clusters) * Math.PI * 2) * 4.6;
  const cy = (c: number) => Math.sin((c / clusters) * Math.PI * 2) * 2.4;

  const cols = Math.ceil(Math.sqrt(count * 1.9));
  for (let i = 0; i < count; i++) {
    const u = i / count;
    seed[i] = r();
    kind[i] = (Math.floor(u * clusters) / clusters + r() * 0.05) % 1;

    // 0: a hollow shell, Fibonacci order
    const yy = 1 - 2 * (i + 0.5) / count;
    const rad = Math.sqrt(1 - yy * yy);
    const th = golden * i;
    const R = 5.2 + gauss(r) * 0.35;
    put(0, i, Math.cos(th) * rad * R * 1.35, yy * R * 0.8, Math.sin(th) * rad * R * 0.7 - 1.5);

    // 1: a ledger. Four rows of beads running left to right, with a gentle wave
    const row = i % 4;
    const along = Math.floor(i / 4) / (count / 4);
    put(1, i, (along - 0.5) * 17, (row - 1.5) * 1.15 + Math.sin(along * 14 + row) * 0.18 + gauss(r) * 0.05, gauss(r) * 0.25 - 0.8);

    // 2: eight clusters
    const c = Math.min(clusters - 1, Math.floor(u * clusters));
    put(2, i, cx(c) + gauss(r) * 0.85, cy(c) + gauss(r) * 0.85, gauss(r) * 0.8 - 1);

    // 3: a double helix standing across the page
    const strand = i % 2;
    const t = (i / count) * Math.PI * 9;
    put(3, i, (u - 0.5) * 15, Math.cos(t + strand * Math.PI) * 2.3 + gauss(r) * 0.07, Math.sin(t + strand * Math.PI) * 2.3 - 1 + gauss(r) * 0.07);

    // 4: a wall. Row-major grid, slightly bowed
    const gx = i % cols;
    const gy = Math.floor(i / cols);
    const rows = Math.ceil(count / cols);
    const px = (gx / cols - 0.5) * 17;
    put(4, i, px, (0.5 - gy / rows) * 8.2 + gauss(r) * 0.03, -Math.abs(px) * 0.07 - 0.5 + gauss(r) * 0.04);

    // 5: a ring that closes, and a few strays at the centre
    const a = u * Math.PI * 2;
    const stray = i % 11 === 0;
    put(5, i, stray ? gauss(r) * 0.9 : Math.cos(a) * 4.4, stray ? gauss(r) * 0.9 : Math.sin(a) * 4.4, stray ? gauss(r) * 0.5 : gauss(r) * 0.12 - 0.5);
  }
  return { targets, seed, kind };
}

export function buildEdges(count: number): Uint32Array {
  const out: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    out.push(i, i + 1);
    if (i % 4 === 0 && i + 9 < count) out.push(i, i + 9);
  }
  return new Uint32Array(out);
}
