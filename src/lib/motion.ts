import { useEffect, useState } from "react";
import { scene } from "./store";

export interface MotionPrefs {
  reduced: boolean;
  lowPower: boolean;
  isTouch: boolean;
}

/** One place that answers "how much motion should this device get". Everything reads from here. */
export function readPrefs(): MotionPrefs {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(pointer: coarse)").matches;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const saving = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData ?? false;
  const lowPower = saving || memory <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 720;
  return { reduced, lowPower, isTouch };
}

export function useMotionPrefs(): MotionPrefs {
  const [prefs, setPrefs] = useState<MotionPrefs>({ reduced: false, lowPower: false, isTouch: false });
  useEffect(() => {
    const apply = () => {
      const p = readPrefs();
      scene.reduced = p.reduced;
      scene.lowPower = p.lowPower;
      scene.isTouch = p.isTouch;
      scene.tier = p.lowPower ? 0 : 2;
      setPrefs(p);
    };
    apply();
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return prefs;
}
