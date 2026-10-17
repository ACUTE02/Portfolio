import { useParams } from "react-router-dom";
import { GoLink, Kinetic, usePage } from "../components/core";
import { bySlug, PROJECTS } from "../data/projects";
import { useRepos } from "../repos";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { slug } = useParams();
  const p = bySlug(slug);
  usePage(p?.title ?? "Not found", p ? "detail" : "lost", p?.slug ?? null);
  const { repos } = useRepos();
  if (!p) return <NotFound />;
  const i = PROJECTS.indexOf(p);
  const prev = PROJECTS[(i + PROJECTS.length - 1) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const live = repos.find((r) => norm(r.name) === norm(p.repoName));
  return (
    <div className="page detail">
      <article className="col">
        <p className="eyebrow">
          {String(i + 1).padStart(2, "0")} · {p.kind}
        </p>
        <h1 id="h1" className="title">
          <Kinetic text={p.title} />
        </h1>
        <p className="muted">{p.status}</p>
        <p className="lede small-lede">{p.summary}</p>
        <p className="figure big">
          <strong style={{ color: p.color }}>{p.figure.value}</strong> <span>{p.figure.label}</span>
        </p>
        <ul className="story">
          {p.story.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <ul className="chips" aria-label="Stack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="actions">
          <a className="btn" href={live?.url ?? p.repo} target="_blank" rel="noopener noreferrer" data-cursor="Open on GitHub">
            Repository
          </a>
          {p.live && (
            <a className="btn ghost" href={p.live} target="_blank" rel="noopener noreferrer" data-cursor="Open the demo">
              Live demo
            </a>
          )}
        </div>
        <nav className="pager" aria-label="More projects">
          <GoLink to={`/projects/${prev.slug}`} cursor="Previous">
            ← {prev.title}
          </GoLink>
          <GoLink to={`/projects/${next.slug}`} cursor="Next">
            {next.title} →
          </GoLink>
        </nav>
      </article>
    </div>
  );
}
