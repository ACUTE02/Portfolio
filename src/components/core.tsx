import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { scene } from "../lib/store";

gsap.registerPlugin(SplitText, useGSAP);

/* ------------------------------------------------------------------ page transition */
interface Go { go: (to: string) => void }
const GoCtx = createContext<Go>({ go: () => {} });
export const useGo = () => useContext(GoCtx).go;

/** A staged wipe over the page while the camera moves to the next pose. With reduced motion: a plain crossfade. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const wipe = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const go = (to: string) => {
    const here = location.hash.replace(/^#/, "") || "/";
    if (busy.current || to === here) return;
    busy.current = true;
    const el = wipe.current!;
    const main = document.getElementById("main");
    if (scene.reduced) {
      gsap.to(main, { opacity: 0, duration: 0.18, onComplete: () => { nav(to); gsap.to(main, { opacity: 1, duration: 0.25, onComplete: () => { busy.current = false; } }); } });
      return;
    }
    const tl = gsap.timeline({ onComplete: () => { busy.current = false; } });
    tl.set(el, { display: "block", clipPath: "inset(100% 0 0 0)" })
      .to(el, { clipPath: "inset(0% 0 0 0)", duration: 0.5, ease: "power3.inOut" })
      .add(() => { nav(to); window.scrollTo(0, 0); })
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.55, ease: "power3.inOut", delay: 0.12 })
      .set(el, { display: "none" });
  };
  return (
    <GoCtx.Provider value={{ go }}>
      {children}
      <div ref={wipe} className="wipe" aria-hidden="true">
        <span>✦</span>
      </div>
    </GoCtx.Provider>
  );
}

/** A link that goes through the transition. Modifier-clicks and middle clicks keep their normal meaning. */
export function GoLink({ to, children, className, cursor, onClick }: { to: string; children: ReactNode; className?: string; cursor?: string; onClick?: () => void }) {
  const go = useGo();
  return (
    <NavLink
      to={to}
      className={className}
      data-cursor={cursor}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.();
        go(to);
      }}
    >
      {children}
    </NavLink>
  );
}

/* ------------------------------------------------------------------ kinetic type */
type Variant = "rise" | "scramble" | "wipe";

/** Splits text into characters and animates them in. Reduced motion: a plain fade. */
export function Kinetic({ text, as: Tag = "span", variant = "rise", delay = 0, className }: { text: string; as?: "span" | "h1" | "h2" | "p"; variant?: Variant; delay?: number; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (scene.reduced) {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, delay });
        return;
      }
      const split = SplitText.create(el, { type: "chars,words", mask: variant === "wipe" ? undefined : "words" });
      if (variant === "rise") {
        gsap.from(split.chars, { yPercent: 110, rotate: 6, opacity: 0, filter: "blur(8px)", duration: 0.9, ease: "power4.out", stagger: 0.022, delay });
      } else if (variant === "wipe") {
        gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut", delay });
      } else {
        // scramble: letters resolve from mixed glyphs; the box keeps its height so nothing jumps
        const final = split.chars.map((c) => c.textContent ?? "");
        const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789<>/+=";
        el.style.minHeight = `${el.getBoundingClientRect().height}px`;
        const o = { p: 0 };
        gsap.to(o, {
          p: 1, duration: 1.1, delay, ease: "none",
          onUpdate: () => split.chars.forEach((c, i) => { c.textContent = o.p > (i + 1) / split.chars.length ? final[i] : final[i] === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0]; }),
          onComplete: () => split.chars.forEach((c, i) => (c.textContent = final[i])),
        });
      }
      return () => split.revert();
    },
    { scope: ref, dependencies: [text] },
  );
  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {text}
    </Tag>
  );
}

/** A word slot that flips through a list in 3D. */
export function WordSlot({ words, every = 2400 }: { words: string[]; every?: number }) {
  const [i, setI] = useState(0);
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (scene.reduced) return;
    const id = setInterval(() => {
      gsap.to(el.current, { rotateX: -90, opacity: 0, duration: 0.28, ease: "power2.in", onComplete: () => {
        setI((n) => (n + 1) % words.length);
        gsap.fromTo(el.current, { rotateX: 90, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
      } });
    }, every);
    return () => clearInterval(id);
  }, [words.length, every]);
  return (
    <span className="slot" aria-live="off">
      <span ref={el} className="slot-word">
        {words[i]}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ pointer niceties */
export function Magnetic({ children, href, to, cursor, className = "btn" }: { children: ReactNode; href?: string; to?: string; cursor?: string; className?: string }) {
  const go = useGo();
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || scene.reduced || e.pointerType !== "mouse") return;
    const b = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.2}px, ${(e.clientY - b.top - b.height / 2) * 0.28}px)`;
  };
  const common = { ref, className: `${className} magnetic`, "data-cursor": cursor, onPointerMove: move, onPointerLeave: () => ref.current && (ref.current.style.transform = "") };
  return href ? (
    <a {...common} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <a {...common} href={`#${to}`} onClick={(e) => { e.preventDefault(); go(to!); }}>
      {children}
    </a>
  );
}

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current!;
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      el.style.opacity = t ? "1" : "0";
      if (t) el.textContent = t.dataset.cursor ?? "";
      el.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 14}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div className="cursor-label" ref={ref} aria-hidden="true" />;
}

/** A big ticker. Faster while you scroll, and it turns around when you scroll back up. */
export function Marquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const dir = useRef(1);
  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const el = track.current;
      if (el) {
        const speed = scene.reduced ? 0 : 40 + Math.abs(scene.scrollV) * 260;
        x.current -= dir.current * speed * dt;
        const half = el.scrollWidth / 2;
        if (half > 0) x.current = ((x.current % half) - half) % half;
        el.style.transform = `translate3d(${x.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onScroll = (() => {
      let y = window.scrollY;
      return () => {
        const d = window.scrollY - y;
        y = window.scrollY;
        if (d !== 0) dir.current = d > 0 ? 1 : -1;
      };
    })();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const row = items.map((t, i) => (
    <span key={t + i} className={i % 2 ? "m-fill" : "m-line"}>
      {t}
    </span>
  ));
  return (
    <div className={`marquee ${scene.reduced ? "static" : ""}`} aria-hidden="true">
      <div className="track" ref={track}>
        {row}
        {row}
      </div>
    </div>
  );
}

/** Sets the mood, the title and the focus after each navigation. */
export function usePage(title: string, mood: typeof scene.mood, slug: string | null = null) {
  const loc = useLocation();
  useEffect(() => {
    scene.mood = mood;
    scene.activeSlug = slug;
    document.title = title === "Home" ? "Ayushmaan Gupta" : `${title} · Ayushmaan Gupta`;
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      if (loc.key !== "default") h1.focus({ preventScroll: true });
    }
  }, [title, mood, slug, loc.key]);
}
