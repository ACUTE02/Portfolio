import { GoLink, Kinetic, Magnetic, Marquee, usePage, WordSlot } from "../components/core";
import { PROFILE, STATS, TICKER } from "../data/profile";
import { PROJECTS } from "../data/projects";

export default function Home() {
  usePage("Home", "home");
  const featured = PROJECTS.slice(0, 3);
  return (
    <div className="page home">
      <section className="hero col" aria-labelledby="h1">
        <p className="eyebrow">{PROFILE.role}</p>
        <h1 id="h1" className="display">
          <Kinetic text={PROFILE.first} />
          <br />
          <Kinetic text={PROFILE.last} delay={0.12} />
        </h1>
        <p className="lede">
          {PROFILE.tagline} <WordSlot words={PROFILE.verbs} />
        </p>
        <p className="muted measure">{PROFILE.intro}</p>
        <div className="actions">
          <Magnetic to="/projects" cursor="See the work">
            See my projects
          </Magnetic>
          <Magnetic to="/contact" className="btn ghost" cursor="Say hi">
            Say hi
          </Magnetic>
          <Magnetic href={PROFILE.resume} className="btn ghost" cursor="Opens my resume">
            Resume
          </Magnetic>
        </div>
      </section>

      <Marquee items={TICKER} />

      <section className="band" aria-label="At a glance">
        <dl className="stats">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="band" aria-labelledby="featured">
        <div className="wide">
          <p className="eyebrow">Featured</p>
          <h2 id="featured">Three things I would show you first</h2>
          <div className="cards">
            {featured.map((p, i) => (
              <GoLink key={p.slug} to={`/projects/${p.slug}`} className="card tilt" cursor="Open">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.title}</h3>
                <p className="muted">{p.summary}</p>
                <p className="figure">
                  <strong>{p.figure.value}</strong> <span>{p.figure.label}</span>
                </p>
              </GoLink>
            ))}
          </div>
          <p className="more">
            <GoLink to="/projects">All {PROJECTS.length} projects</GoLink> · <GoLink to="/lab">every repository</GoLink>
          </p>
        </div>
      </section>
    </div>
  );
}
