import Lenis from "lenis";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { GoLink, Cursor, useGo } from "./core";
import { PROFILE } from "../data/profile";
import { useMotionPrefs } from "../lib/motion";
import { scene, webglAvailable } from "../lib/store";

const SceneRoot = lazy(() => import("../scene/SceneRoot"));

const LINKS = [
  { to: "/projects", label: "Projects" },
  { to: "/stack", label: "Stack" },
  { to: "/lab", label: "Repositories" },
  { to: "/journey", label: "Journey" },
  { to: "/contact", label: "Contact" },
];

export function Layout({ children }: { children: ReactNode }) {
  const prefs = useMotionPrefs();
  const [gl, setGl] = useState(false);
  const [menu, setMenu] = useState(false);
  const go = useGo();

  useEffect(() => {
    if (!webglAvailable() || prefs.reduced && prefs.lowPower) return;
    // after first paint, so the text is readable before the canvas exists
    const id = requestAnimationFrame(() => setGl(true));
    return () => cancelAnimationFrame(id);
  }, [prefs.reduced, prefs.lowPower]);

  // smooth scroll, pointer and scroll speed for the canvas
  useEffect(() => {
    const lenis = prefs.reduced ? null : new Lenis({ lerp: 0.1 });
    let raf = 0;
    let lastY = window.scrollY;
    const tick = (t: number) => {
      lenis?.raf(t);
      const v = Math.abs(window.scrollY - lastY) / 40;
      lastY = window.scrollY;
      scene.scrollV += (v - scene.scrollV) * 0.12;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const pointer = (e: PointerEvent) => {
      scene.px = (e.clientX / window.innerWidth - 0.5) * 2;
      scene.py = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", pointer);
      lenis?.destroy();
    };
  }, [prefs.reduced]);

  // the menu is a full-screen overlay: trap Escape, and stop the page behind it from scrolling
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>
        Skip to the content
      </a>
      <div className="backdrop" aria-hidden="true" />
      {gl && (
        <Suspense fallback={null}>
          <div id="stage" aria-hidden="true">
            <SceneRoot />
          </div>
        </Suspense>
      )}
      <header className="site-header">
        <GoLink to="/" className="brand" cursor="Home">
          <span className="mark">A·G</span> Ayushmaan Gupta
        </GoLink>
        <nav aria-label="Pages" className="nav">
          {LINKS.map((l) => (
            <GoLink key={l.to} to={l.to}>
              {l.label}
            </GoLink>
          ))}
        </nav>
        <button className="menu-btn" aria-expanded={menu} aria-controls="menu" onClick={() => setMenu((m) => !m)}>
          {menu ? "Close" : "Menu"}
        </button>
      </header>
      {menu && (
        <div id="menu" className="menu" role="dialog" aria-label="Pages">
          {[{ to: "/", label: "Home" }, ...LINKS].map((l) => (
            <a key={l.to} href={`#${l.to}`} onClick={(e) => { e.preventDefault(); setMenu(false); go(l.to); }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <span>{PROFILE.name} · 2026 · built from threads, not templates ✦</span>
        <span>
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a> ·{" "}
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a> ·{" "}
          <a href={PROFILE.resume} target="_blank" rel="noopener noreferrer">Resume</a>
        </span>
      </footer>
      <Cursor />
    </>
  );
}
