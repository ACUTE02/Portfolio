import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { CERTS, PROFILE, PROJECTS } from "./data";

beforeEach(() => {
  sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
});

describe("the portfolio", () => {
  it("has one h1 with the name, a skip link and a main landmark", () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Ayushmaan");
    expect(container.querySelector("a.skip")).not.toBeNull();
    expect(container.querySelector("main")).not.toBeNull();
  });

  it("links the resume, GitHub and LinkedIn in a new tab without leaking the opener", () => {
    const { container } = render(<App />);
    for (const href of [PROFILE.resume, PROFILE.github, PROFILE.linkedin]) {
      const a = container.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)!;
      expect(a).not.toBeNull();
      expect(a.target).toBe("_blank");
      expect(a.rel).toBe("noopener noreferrer");
    }
  });

  it("shows every project with its repository link", () => {
    const { container } = render(<App />);
    for (const p of PROJECTS) {
      expect(screen.getAllByText(p.title).length).toBeGreaterThan(0);
      if (p.repo) expect(container.querySelector(`a[href="${p.repo}"]`)).not.toBeNull();
    }
  });

  it("falls back to the repositories the resumes link to when GitHub cannot be reached", async () => {
    render(<App />);
    const wall = await screen.findByText(/could not be reached just now/);
    expect(wall).toBeDefined();
    const links = document.querySelectorAll(".repo-wall a");
    expect(links.length).toBeGreaterThanOrEqual(8);
    expect(within(links[0] as HTMLElement).getByText("Trust_Mesh")).toBeDefined();
  });

  it("publishes no phone number, and lists the four certifications", () => {
    const { container } = render(<App />);
    expect(container.textContent).not.toMatch(/\+?91\s?7652|7652042022/);
    expect(CERTS).toHaveLength(4);
    for (const c of CERTS) expect(screen.getByText(c.name)).toBeDefined();
  });

  it("is dark only: no light colour scheme is declared in the styles", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync("src/styles.css", "utf-8");
    expect(css).toContain("color-scheme: dark");
    expect(css).not.toMatch(/prefers-color-scheme:\s*light/);
  });
});
