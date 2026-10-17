import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { TransitionProvider } from "./components/core";
import Home from "./pages/Home";

const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Stack = lazy(() => import("./pages/Stack"));
const Lab = lazy(() => import("./pages/Lab"));
const Journey = lazy(() => import("./pages/Journey"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// HashRouter: the site works on GitHub Pages and anywhere else static, with no server rewrite rules.
export default function App() {
  return (
    <HashRouter>
      <TransitionProvider>
        <Layout>
          <Suspense fallback={<div className="page"><p className="muted">Loading.</p></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/stack" element={<Stack />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </TransitionProvider>
    </HashRouter>
  );
}
