# Ayushmaan Gupta: portfolio

A single-page 3D portfolio. One canvas of nodes and threads re-arranges itself for each chapter (start, path, skills, work, repositories, contact). React, Three.js (react-three-fiber), Lenis, dark only. Every public repository is read live from the GitHub API, with the list from the resumes as a fallback.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type check, tests, production build into dist/
```

## Publish on GitHub Pages
1. Create a repository (for the address `https://ACUTE02.github.io`, name it `ACUTE02.github.io`; any other name works too and is served under `/<name>/`).
2. Push this folder to its `main` branch.
3. Repository Settings, Pages, Source: **GitHub Actions**. The workflow in `.github/workflows/pages.yml` builds and deploys on every push.

Content lives in `src/data.ts`. The phone number is deliberately not published.
