import { useEffect, useMemo, useState } from "react";
import { Kinetic, usePage } from "../components/core";
import { scene } from "../lib/store";
import { useRepos } from "../repos";

export default function Lab() {
  usePage("Repositories", "lab");
  const { repos, state } = useRepos();
  const [lang, setLang] = useState("All");
  useEffect(() => {
    scene.repos = repos.map((r) => ({ language: r.language, updated: r.updated, stars: r.stars }));
  }, [repos]);
  const languages = useMemo(() => ["All", ...Array.from(new Set(repos.map((r) => r.language).filter(Boolean) as string[])).sort()], [repos]);
  const shown = repos.filter((r) => lang === "All" || r.language === lang);
  return (
    <div className="page lab">
      <div className="col">
        <p className="eyebrow">Every repository</p>
        <h1 id="h1" className="title">
          <Kinetic text="The whole lab, straight from GitHub" />
        </h1>
        <p className="muted small" role="status">
          {state === "live" && `${repos.length} public repositories, read live from the GitHub API. Taller columns were pushed more recently; colour is the language.`}
          {state === "snapshot" && `${repos.length} public repositories, as last read from GitHub. The live list replaces this as soon as GitHub answers (it limits anonymous reads, so it can take a while).`}
        </p>
        <div className="filters" role="group" aria-label="Filter by language">
          {languages.map((l) => (
            <button key={l} className="filter" aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <ul className="repo-wall wide">
        {shown.map((r) => (
          <li key={r.name}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" data-cursor="Open on GitHub">
              <span className="repo-name">{r.name}</span>
              <span className="repo-desc">{r.description ?? "No description."}</span>
              <span className="repo-meta">
                {r.language ?? "n/a"}
                {r.stars > 0 && ` · ${r.stars} stars`}
                {r.updated && ` · ${r.updated.slice(0, 10)}`}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
