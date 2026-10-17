// Shared, mutable state between the page (scroll, pointer) and the canvas. Not React state: it changes every frame.
export const live = {
  stage: 0, // where the page is, in chapters (0 to 5, fractional)
  smooth: 0, // the scene's eased copy of `stage`
  px: 0,
  py: 0,
  reduced: false,
};

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** A cheap quality tier: fewer nodes on touch screens and small or low-memory devices. */
export function nodeCount(): number {
  const small = window.innerWidth < 720;
  const touch = matchMedia("(pointer: coarse)").matches;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (small || touch || memory <= 4 || cores <= 4) return 1800;
  return 4200;
}
