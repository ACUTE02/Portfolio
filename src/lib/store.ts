// Shared, mutable state between the DOM and the canvas. Not React state: it changes every frame.
export type Mood = "home" | "projects" | "detail" | "stack" | "lab" | "journey" | "contact" | "lost";

export const scene = {
  mood: "home" as Mood,
  activeSlug: null as string | null, // project shown on a detail page
  carouselIndex: 0, // front project of the carousel (set by the page)
  carouselTarget: 0, // continuous rotation target, in project steps
  px: 0, // pointer, -1..1
  py: 0,
  scrollV: 0, // scroll velocity, smoothed
  sendAt: -1, // time the contact plane was launched
  hover: null as string | null, // skill under the pointer
  repos: [] as { language: string | null; updated: string; stars: number }[], // for the repository wall
  reduced: false,
  lowPower: false,
  isTouch: false,
  tier: 1, // quality tier 0 (lightest) .. 2
};

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
