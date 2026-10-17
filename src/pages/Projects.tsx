import { useCallback, useEffect, useRef, useState } from "react";
import { GoLink, Kinetic, usePage } from "../components/core";
import { PROJECTS } from "../data/projects";
import { scene } from "../lib/store";

export default function Projects() {
  usePage("Projects", "projects");
  const N = PROJECTS.length;
  const [idx, setIdx] = useState(0);
  const [list, setList] = useState(false);
  const target = useRef(0);
  const wrap = useCallback((n: number) => ((Math.round(n) % N) + N) % N, [N]);
  const set = useCallback(
    (n: number) => {
      target.current = n;
      scene.carouselTarget = n;
      setIdx(wrap(n));
    },
    [wrap],
  );

  // drag, wheel and arrow keys all move the same target
  useEffect(() => {
    scene.carouselTarget = target.current;
    let down = false;
    let x0 = 0;
    let t0 = 0;
    let lastWheel = 0;
    const pd = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a, .panel-ui, input")) return;
      down = true;
      x0 = e.clientX;
      t0 = target.current;
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      target.current = t0 - (e.clientX - x0) / 180;
      scene.carouselTarget = target.current;
      setIdx(wrap(target.current));
    };
    const pu = () => {
      if (!down) return;
      down = false;
      set(Math.round(target.current));
    };
    const wheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now - lastWheel < 450 || Math.abs(e.deltaX) + Math.abs(e.deltaY) < 8) return;
      lastWheel = now;
      set(Math.round(target.current) + (e.deltaY + e.deltaX > 0 ? 1 : -1));
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") set(Math.round(target.current) + 1);
      if (e.key === "ArrowLeft") set(Math.round(target.current) - 1);
    };
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, [wrap, set]);

  const p = PROJECTS[idx];
  return (
    <div className="page projects">
      <header className="col top">
        <p className="eyebrow">Selected work</p>
        <h1 id="h1" className="title">
          <Kinetic text="Eleven projects, each with its own object" />
        </h1>
      </header>

      {!list ? (
        <section className="panel-ui" aria-live="polite" aria-label="Project carousel">
          <p className="num">
            {String(idx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </p>
          <h2>{p.title}</h2>
          <p className="muted">
            {p.kind} · {p.status}
          </p>
          <p className="measure">{p.summary}</p>
          <div className="actions">
            <button className="btn ghost" onClick={() => set(Math.round(target.current) - 1)} aria-label="Previous project" data-cursor="Previous">
              ←
            </button>
            <GoLink to={`/projects/${p.slug}`} className="btn" cursor="Open">
              Open the project
            </GoLink>
            <button className="btn ghost" onClick={() => set(Math.round(target.current) + 1)} aria-label="Next project" data-cursor="Next">
              →
            </button>
            <button className="btn ghost" onClick={() => setList(true)}>
              List view
            </button>
          </div>
          <p className="hint muted small">Drag, scroll or use the arrow keys to turn the ring.</p>
        </section>
      ) : (
        <section className="wide listview" aria-label="All projects">
          <button className="btn ghost" onClick={() => setList(false)}>
            Back to the ring
          </button>
          <div className="cards">
            {PROJECTS.map((q, i) => (
              <GoLink key={q.slug} to={`/projects/${q.slug}`} className="card tilt" cursor="Open">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{q.title}</h3>
                <p className="muted small">
                  {q.kind} · {q.status}
                </p>
                <p>{q.summary}</p>
              </GoLink>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
