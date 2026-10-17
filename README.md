# Ayushmaan Gupta: 3D portfolio

Multi-page, one persistent WebGL canvas. React 19, Three.js (react-three-fiber), GSAP (SplitText), Lenis, react-router (hash routes, so it works on any static host). Dark only.

| Route | Page | 3D object |
|---|---|---|
| `#/` | Home | a knot of threads and nodes with an orbit of tech tokens |
| `#/projects` | Projects | a ring of 11 objects, one per project (graph + waveform for TrustMesh, banded globe for the climate agents, a forgetting curve for the learning platform, ...) |
| `#/projects/:slug` | Project | the same object, large, beside the story |
| `#/stack` | Stack | skills as a graph, joined where they were used together |
| `#/lab` | Repositories | every public repo, read live from GitHub, as a wall of columns |
| `#/journey` | Journey | a spiral of milestones |
| `#/contact` | Contact | a beacon and a paper plane (opens your email app; nothing is sent from the page) |

The background is a contour map of a drifting height field (fragment shader) that reacts to the pointer and to scroll speed and changes colour per page.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type check, tests, production build into dist/
```

Content lives in `src/data/*.ts` (profile, projects, stack, journey). Components only render it. The phone number is not published.
Reduced motion: no wipes, no smooth scroll, plain fades, a slowed background. No WebGL: the page is fully readable without the canvas.

Publish: push to a repo named `ACUTE02.github.io`, then Settings, Pages, Source "GitHub Actions" (workflow included).
