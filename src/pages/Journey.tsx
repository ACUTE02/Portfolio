import { Kinetic, usePage } from "../components/core";
import { JOURNEY } from "../data/journey";
import { PROFILE } from "../data/profile";

const LABEL = { education: "Education", experience: "Experience", cert: "Certification", hackathon: "Hackathon" } as const;

export default function Journey() {
  usePage("Journey", "journey");
  return (
    <div className="page journey">
      <div className="col">
        <p className="eyebrow">Journey</p>
        <h1 id="h1" className="title">
          <Kinetic text="Study, credentials, and what I am doing now" />
        </h1>
        <p className="muted measure">
          {PROFILE.school}, {PROFILE.degree}, {PROFILE.years}. CGPA {PROFILE.cgpa}.
        </p>
        <ol className="timeline">
          {JOURNEY.map((m) => (
            <li key={m.id} data-kind={m.kind}>
              <p className="small muted">
                {LABEL[m.kind]} · {m.when}
              </p>
              <h2>
                {m.url ? (
                  <a href={m.url} target="_blank" rel="noopener noreferrer">
                    {m.title}
                  </a>
                ) : (
                  m.title
                )}
              </h2>
              <p className="muted">{m.where}</p>
              <p>{m.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
