import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { CERTS, CHAPTERS, EXPERIENCE, PROFILE, PROJECTS, SKILLS, type Project } from "./data";
import { live, nodeCount, webglAvailable } from "./live";
import { useRepos, type Repo } from "./repos";

const Scene = lazy(() => import("./Scene"));

/* ---------------------------------------------------------------- small pieces */

/** Words rise out of a mask when they scroll into view. With reduced motion they are simply there. */
function Kinetic({ text, as: Tag = "span" }: { text: string; as?: "span" | "h1" | "h2" }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Seen once its top has come up past the lower part of the screen, including when a link jumped over it.
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
        setSeen(true);
        window.removeEventListener("scroll", check);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <Tag ref={ref as never} className="kinetic" data-seen={seen ? "1" : "0"}>
      {text.split(" ").map((w, i) => (
        <span className="kt-mask" key={i}>
          <span className="kt-word" style={{ transitionDelay: `${i * 45}ms` }}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** A button that leans toward the pointer. Pointer devices only. */
function Magnetic({ children, href, label }: { children: ReactNode; href: string; label?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || live.reduced || e.pointerType !== "mouse") return;
    const b = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.22}px, ${(e.clientY - b.top - b.height / 2) * 0.3}px)`;
  };
  return (
    <a
      ref={ref}
      className="btn magnetic"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor={label}
      onPointerMove={move}
      onPointerLeave={() => ref.current && (ref.current.style.transform = "")}
    >
      {children}
    </a>
  );
}

/** A small label that follows the pointer over anything marked data-cursor. */
function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current!;
    const move = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      el.style.opacity = target ? "1" : "0";
      if (target) el.textContent = target.dataset.cursor ?? "";
      el.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 14}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div className="cursor-label" ref={ref} aria-hidden="true" />;
}

function Dot({ done }: { done?: boolean }) {
  return <span className={`dot ${done ? "dot-done" : ""}`} aria-hidden="true" />;
}

/* ---------------------------------------------------------------- chapters */

function Hero() {
  return (
    <section id="top" data-chapter className="chapter hero" aria-labelledby="h-top">
      <div className="wrap">
        <p className="eyebrow">{PROFILE.role}</p>
        <h1 id="h-top">
          <Kinetic text={PROFILE.name} />
        </h1>
        <p className="lede">{PROFILE.line}</p>
        <p className="muted measure">
          B.Tech in AI and Machine Learning at VIT Bhopal. I work on agentic GenAI, forecasting and evaluation, and I would rather report
          "no skill" honestly than a confident number I cannot defend.
        </p>
        <div className="actions">
          <Magnetic href={PROFILE.resume} label="Opens my resume">
            Resume
          </Magnetic>
          <Magnetic href={PROFILE.github} label="All repositories">
            GitHub
          </Magnetic>
          <Magnetic href={PROFILE.linkedin} label="LinkedIn">
            LinkedIn
          </Magnetic>
        </div>
        <dl className="stats" aria-label="At a glance">
          <div>
            <dt>CGPA</dt>
            <dd>8.40</dd>
          </div>
          <div>
            <dt>Forecast skill, 1-month lead</dt>
            <dd>+0.21 to +0.26</dd>
          </div>
          <div>
            <dt>Automated tests, one project</dt>
            <dd>300+</dd>
          </div>
          <div>
            <dt>Certifications</dt>
            <dd>4</dd>
          </div>
        </dl>
      </div>
      <p className="scroll-hint" aria-hidden="true">
        scroll
      </p>
    </section>
  );
}

function Path() {
  return (
    <section id="path" data-chapter className="chapter" aria-labelledby="h-path">
      <div className="wrap two">
        <div className="card">
          <p className="eyebrow">Education</p>
          <h2 id="h-path">
            <Kinetic text="Where I study" />
          </h2>
          <p className="big">{PROFILE.school}</p>
          <p>{PROFILE.degree}</p>
          <p className="muted">
            {PROFILE.years} · CGPA {PROFILE.cgpa}
          </p>
          <ul className="chips" aria-label="Relevant coursework">
            {PROFILE.coursework.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <p className="eyebrow">Experience</p>
          <h2>
            <Kinetic text="What I am doing now" />
          </h2>
          <p className="big">{EXPERIENCE.org}</p>
          <p>{EXPERIENCE.program}</p>
          <p className="muted">
            {EXPERIENCE.when} · {EXPERIENCE.kind}
          </p>
          <ul className="plain">
            {EXPERIENCE.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" data-chapter className="chapter" aria-labelledby="h-skills">
      <div className="wrap">
        <p className="eyebrow">Skills</p>
        <h2 id="h-skills">
          <Kinetic text="Eight clusters, one thread through them" />
        </h2>
        <div className="skill-grid">
          {SKILLS.map((g) => (
            <div className="card slim" key={g.group}>
              <h3>{g.group}</h3>
              <ul className="chips">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ p, repoUrl, index }: { p: Project; repoUrl: string | null; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const bodyId = `proj-${p.id}`;
  return (
    <article className="project" data-open={open ? "1" : "0"}>
      <header>
        <span className="num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="grow">
          <h3>{p.title}</h3>
          <p className="muted small">
            <Dot done={p.status === "Shipped" || p.status === "Built"} /> {p.status}
          </p>
        </div>
        <div className="figure" aria-label={p.figure.label}>
          <strong>{p.figure.value}</strong>
          <span>{p.figure.label}</span>
        </div>
      </header>
      <p className="summary">{p.summary}</p>
      <button className="toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((v) => !v)} data-cursor={open ? "Close" : "Open"}>
        {open ? "Hide the details" : "Show the details"}
      </button>
      <div id={bodyId} hidden={!open} className="body">
        <ul className="plain">
          {p.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <ul className="chips" aria-label="Stack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="repo-link">
          {repoUrl ? (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              View the repository
            </a>
          ) : (
            <span className="muted">The repository is not public yet.</span>
          )}
        </p>
      </div>
    </article>
  );
}

function Work({ repos }: { repos: Repo[] }) {
  const urlFor = (p: Project) => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const live = p.repoName ? repos.find((r) => norm(r.name) === norm(p.repoName!)) : undefined;
    return live?.url ?? p.repo;
  };
  return (
    <section id="work" data-chapter className="chapter" aria-labelledby="h-work">
      <div className="wrap">
        <p className="eyebrow">Selected work</p>
        <h2 id="h-work">
          <Kinetic text="Six projects, with the numbers I can defend" />
        </h2>
        <div className="projects">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} p={p} repoUrl={urlFor(p)} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Repos({ repos, state }: { repos: Repo[]; state: "loading" | "live" | "fallback" }) {
  const [lang, setLang] = useState<string>("All");
  const languages = useMemo(() => ["All", ...Array.from(new Set(repos.map((r) => r.language).filter(Boolean) as string[])).sort()], [repos]);
  const shown = repos.filter((r) => lang === "All" || r.language === lang);
  return (
    <section id="repos" data-chapter className="chapter" aria-labelledby="h-repos">
      <div className="wrap">
        <p className="eyebrow">Every repository</p>
        <h2 id="h-repos">
          <Kinetic text="The whole wall, straight from GitHub" />
        </h2>
        <p className="muted small" role="status">
          {state === "live" && `${repos.length} public repositories, read live from the GitHub API.`}
          {state === "loading" && "Reading the repositories from GitHub."}
          {state === "fallback" && "GitHub could not be reached just now, so this is the list the resumes link to."}
        </p>
        <div className="filters" role="group" aria-label="Filter by language">
          {languages.map((l) => (
            <button key={l} className="filter" aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l}
            </button>
          ))}
        </div>
        <ul className="repo-wall">
          {shown.map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" data-cursor="Open on GitHub">
                <span className="repo-name">{r.name}</span>
                <span className="repo-desc">{r.description ?? "No description."}</span>
                <span className="repo-meta">
                  {r.language ?? "n/a"}
                  {r.stars > 0 && ` · ${r.stars} stars`}
                  {r.fork && " · fork"}
                  {r.updated && ` · ${r.updated.slice(0, 10)}`}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" data-chapter className="chapter last" aria-labelledby="h-contact">
      <div className="wrap">
        <p className="eyebrow">Proof and contact</p>
        <h2 id="h-contact">
          <Kinetic text="If it is a hard problem, I would like to hear about it" />
        </h2>
        <ul className="certs">
          {CERTS.map((c) => (
            <li key={c.name}>
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                <strong>{c.name}</strong>
                <span>{c.by}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="actions">
          <Magnetic href={`mailto:${PROFILE.email}`} label="Write to me">
            {PROFILE.email}
          </Magnetic>
          <Magnetic href={PROFILE.resume} label="Opens my resume">
            Resume
          </Magnetic>
        </div>
        <p className="muted small foot">Built with React, Three.js and Lenis. Dark only. The background is one canvas; nothing plays sound.</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- page */

export default function App() {
  const { repos, state } = useRepos();
  const [gl, setGl] = useState(false);
  const [count, setCount] = useState(2000);
  const [active, setActive] = useState(0);

  useEffect(() => {
    live.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!saving && webglAvailable()) {
      setCount(nodeCount());
      setGl(true);
    }
  }, []);

  // Smooth scroll, and the chapter the page is in (fractional) for the canvas.
  useEffect(() => {
    const lenis = live.reduced ? null : new Lenis({ lerp: 0.09 });
    let raf = 0;
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const update = () => {
      const s = sections();
      if (!s.length) return;
      const mid = window.scrollY + window.innerHeight * 0.5;
      let i = 0;
      while (i < s.length - 1 && s[i + 1].offsetTop <= mid) i++;
      const next = s[i + 1];
      const top = s[i].offsetTop;
      const span = next ? next.offsetTop - top : 1;
      live.stage = Math.min(s.length - 1, i + (next ? Math.min(1, Math.max(0, (mid - top) / span)) : 0));
      setActive((a) => (a === i ? a : i));
    };
    const tick = (t: number) => {
      lenis?.raf(t);
      update();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const pointer = (e: PointerEvent) => {
      live.px = (e.clientX / window.innerWidth - 0.5) * 2;
      live.py = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", pointer);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <a className="skip" href="#path">
        Skip to the content
      </a>
      <div className="backdrop" aria-hidden="true" />
      {gl && (
        <Suspense fallback={null}>
          <div id="stage" aria-hidden="true">
            <Scene count={count} />
          </div>
        </Suspense>
      )}
      <header className="site-header">
        <a className="brand" href="#top">
          Ayushmaan Gupta
        </a>
        <nav aria-label="Chapters">
          {CHAPTERS.slice(1).map((c, i) => (
            <a key={c.id} href={`#${c.id}`} aria-current={active === i + 1 ? "true" : undefined}>
              {c.label}
            </a>
          ))}
        </nav>
        <div className="thread" aria-hidden="true">
          <i style={{ width: `${(active / (CHAPTERS.length - 1)) * 100}%` }} />
        </div>
      </header>
      <main>
        <Hero />
        <Path />
        <Skills />
        <Work repos={repos} />
        <Repos repos={repos} state={state} />
        <Contact />
      </main>
      <CursorLabel />
    </>
  );
}
