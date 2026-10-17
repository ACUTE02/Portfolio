import { useEffect, useState } from "react";
import { FALLBACK_REPOS, PROFILE } from "./data";

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  stars: number;
  updated: string;
  fork: boolean;
}

const KEY = "portfolio.repos.v1";
const TTL_MS = 10 * 60 * 1000;

function readCache(): Repo[] | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const { at, repos } = JSON.parse(raw) as { at: number; repos: Repo[] };
    return Date.now() - at < TTL_MS ? repos : null;
  } catch {
    return null;
  }
}

/** Every public repository of the account, live from the GitHub API. If that fails, the repositories the resumes link to. */
export function useRepos(): { repos: Repo[]; state: "loading" | "live" | "fallback" } {
  const [repos, setRepos] = useState<Repo[]>(FALLBACK_REPOS as Repo[]);
  const [state, setState] = useState<"loading" | "live" | "fallback">("loading");
  useEffect(() => {
    let live = true;
    const cached = readCache();
    if (cached) {
      setRepos(cached);
      setState("live");
      return;
    }
    fetch(`https://api.github.com/users/${PROFILE.githubUser}/repos?per_page=100&sort=updated`, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((rows: Array<Record<string, unknown>>) => {
        if (!live) return;
        const mapped: Repo[] = rows.map((x) => ({
          name: String(x.name),
          description: (x.description as string | null) ?? null,
          language: (x.language as string | null) ?? null,
          url: String(x.html_url),
          stars: Number(x.stargazers_count ?? 0),
          updated: String(x.pushed_at ?? x.updated_at ?? ""),
          fork: Boolean(x.fork),
        }));
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), repos: mapped }));
        } catch {
          /* storage is a convenience only */
        }
        setRepos(mapped);
        setState("live");
      })
      .catch(() => live && setState("fallback"));
    return () => {
      live = false;
    };
  }, []);
  return { repos, state };
}
