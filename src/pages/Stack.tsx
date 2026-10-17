import { useEffect, useState } from "react";
import { Kinetic, usePage } from "../components/core";
import { GROUPS, SKILLS } from "../data/stack";

export default function Stack() {
  usePage("Stack", "stack");
  const [hover, setHover] = useState<string | null>(null);
  // the canvas tells the page which skill is under the pointer, and the page can tell the canvas the same
  useEffect(() => {
    const on = (e: Event) => setHover((e as CustomEvent<string | null>).detail);
    window.addEventListener("skill-hover", on);
    return () => window.removeEventListener("skill-hover", on);
  }, []);
  const send = (id: string | null) => window.dispatchEvent(new CustomEvent("skill-hover-dom", { detail: id }));
  return (
    <div className="page stack">
      <div className="col">
        <p className="eyebrow">Skills</p>
        <h1 id="h1" className="title">
          <Kinetic text="Skills, joined where I used them together" />
        </h1>
        <p className="muted measure">
          Every line is a pair that appears in one of my projects. Hover a skill, here or in the sphere, to light up what it connects to.
        </p>
        <div className="groups">
          {GROUPS.map((g) => (
            <section key={g.id} aria-label={g.label}>
              <h2 style={{ color: g.color }}>{g.label}</h2>
              <ul className="chips">
                {SKILLS.filter((s) => s.group === g.id).map((s) => (
                  <li key={s.id}>
                    <button
                      className={`chip ${hover === s.id ? "on" : ""}`}
                      onPointerEnter={() => send(s.id)}
                      onPointerLeave={() => send(null)}
                      onFocus={() => send(s.id)}
                      onBlur={() => send(null)}
                    >
                      {s.id}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
