import { useEffect, useState } from "react";
import { PROFILE } from "./data/profile";
import snapshot from "./data/repos.snapshot.json";

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  stars: number;
  updated: string;
  fork: boolean;
}

// The list taken from GitHub when the site was last built. It is the first thing shown and the safety net: the unauthenticated
// GitHub API allows only 60 requests an hour per IP address, so a live read can be refused at any time.
const SNAPSHOT: Repo[] = (snapshot as { repos: Repo[] }).repos;

const KEY = "portfolio.repos.v3";
const TTL_MS = 30 * 60 * 1000;

export type RepoState = "snapshot" | "live";

function readCache(): Repo[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { at, repos } = JSON.parse(raw) as { at: number; repos: Repo[] };
    return Date.now() - at < TTL_MS && repos.length ? repos : null;
  } catch {
    return null;
  }
}

// One request shared by every page, and after a refusal no second attempt in this visit.
let inflight: Promise<Repo[] | null> | null = null;

function load(): Promise<Repo[] | null> {
  inflight ??= fetch(`https://api.github.com/users/${PROFILE.githubUser}/repos?per_page=100&sort=updated`, { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((rows: Array<Record<string, unknown>>) => {
      const mapped: Repo[] = rows.map((x) => ({
        name: String(x.name),
        description: (x.description as string | null) ?? null,
        language: (x.language as string | null) ?? null,
        url: String(x.html_url),
        stars: Number(x.stargazers_count ?? 0),
        updated: String(x.pushed_at ?? x.updated_at ?? ""),
        fork: Boolean(x.fork),
      }));
      if (!mapped.length) return null;
      try {
        localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), repos: mapped }));
      } catch {
        /* storage is a convenience only */
      }
      return mapped;
    })
    .catch(() => null);
  return inflight;
}

/** Every public repository of the account. Starts from the cache or the built-in snapshot (never empty, with real languages),
 *  then upgrades to the live list when GitHub answers. */
export function useRepos(): { repos: Repo[]; state: RepoState } {
  const cached = readCache();
  const [repos, setRepos] = useState<Repo[]>(cached ?? SNAPSHOT);
  const [state, setState] = useState<RepoState>(cached ? "live" : "snapshot");
  useEffect(() => {
    if (cached) return;
    let alive = true;
    load().then((r) => {
      if (alive && r) {
        setRepos(r);
        setState("live");
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { repos, state };
}
