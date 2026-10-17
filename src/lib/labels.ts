import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

const cache = new Map<string, CanvasTexture>();

/** A small text texture for a 3D sprite. Cached, so each label is drawn once. */
export function labelTexture(text: string, color: string, size = 44): CanvasTexture {
  const key = `${text}|${color}|${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = `600 ${size}px "Martian Mono Variable", ui-monospace, Consolas, monospace`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 24;
  c.width = w;
  c.height = size + 24;
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, 12, c.height / 2 + 2);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.userData = { aspect: c.width / c.height };
  cache.set(key, tex);
  return tex;
}
