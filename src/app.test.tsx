import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { JOURNEY } from "./data/journey";
import { PROFILE } from "./data/profile";
import { PROJECTS } from "./data/projects";
import { LINKS, SKILLS } from "./data/stack";

const at = (hash: string) => {
  window.location.hash = hash;
  return render(<App />);
};

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
});

describe("the data", () => {
  it("has eleven projects with unique slugs, a repository each, and no empty story", () => {
    expect(PROJECTS).toHaveLength(11);
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(11);
    for (const p of PROJECTS) {
      expect(p.repo).toMatch(/^https:\/\/github\.com\/ACUTE02\//);
      expect(p.story.length).toBeGreaterThan(1);
    }
  });

  it("links skills only to skills that exist, so no thread in the stack graph points nowhere", () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    for (const [a, b] of LINKS) {
      expect(ids.has(a), a).toBe(true);
      expect(ids.has(b), b).toBe(true);
    }
  });

  it("states no year for a certification, because the resumes give none", () => {
    for (const m of JOURNEY.filter((x) => x.kind === "cert")) expect(m.when).toBe("Certificate");
  });
});

describe("the pages", () => {
  it("home: one h1 with the name, a skip link, a main landmark, and the three actions", () => {
    const { container } = at("#/");
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.textContent).toContain("Ayushmaan");
    expect(container.querySelector("a.skip")).not.toBeNull();
    expect(container.querySelector("main#main")).not.toBeNull();
    expect(screen.getByText("See my projects")).toBeDefined();
    const resume = container.querySelector<HTMLAnchorElement>(`a[href="${PROFILE.resume}"]`)!;
    expect(resume.target).toBe("_blank");
    expect(resume.rel).toBe("noopener noreferrer");
  });

  it("projects: lists every project in the accessible list view", async () => {
    at("#/projects");
    const btn = await screen.findByText("List view");
    btn.click();
    for (const p of PROJECTS) expect((await screen.findAllByText(p.title)).length).toBeGreaterThan(0);
  });

  it("a project page: shows the story, the stack and a repository link", async () => {
    const p = PROJECTS[1];
    const { container } = at(`#/projects/${p.slug}`);
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(container.textContent).toContain(p.story[0].slice(0, 40)));
    expect(container.querySelector(`a[href="${p.repo}"]`)).not.toBeNull();
  });

  it("an unknown project falls back to the 404 page", async () => {
    at("#/projects/not-a-project");
    expect(await screen.findByLabelText(/leads nowhere/)).toBeDefined(); // the headline is split into characters, its label is whole
  });

  it("repositories: falls back to the projects' repositories when GitHub cannot be reached", async () => {
    at("#/lab");
    expect(await screen.findByText(/could not be reached just now/)).toBeDefined();
    expect(document.querySelectorAll(".repo-wall a").length).toBe(PROJECTS.length);
  });

  it("contact: validates, and says honestly that nothing is sent from the page", async () => {
    at("#/contact");
    expect(await screen.findByText(/Nothing is sent from this page/)).toBeDefined();
    screen.getByText("Send the plane").click();
    expect(await screen.findByText("Tell me your name.")).toBeDefined();
    expect(screen.getByText(/does not look right/)).toBeDefined();
  });

  it("publishes no phone number anywhere", async () => {
    for (const h of ["#/", "#/journey", "#/contact"]) {
      const { container, unmount } = at(h);
      await screen.findAllByRole("heading");
      expect(container.textContent).not.toMatch(/7652042022|\+91\s?7652/);
      unmount();
    }
  });
});

describe("the look", () => {
  it("is dark only", () => {
    const css = readFileSync("src/styles.css", "utf-8");
    expect(css).toContain("color-scheme: dark");
    expect(css).not.toMatch(/prefers-color-scheme:\s*light/);
  });

  it("has a calm alternative for reduced motion in the stylesheet", () => {
    expect(readFileSync("src/styles.css", "utf-8")).toContain("prefers-reduced-motion: reduce");
  });
});
