import { useState } from "react";
import { Kinetic, Magnetic, usePage } from "../components/core";
import { PROFILE } from "../data/profile";
import { scene } from "../lib/store";

export default function Contact() {
  usePage("Contact", "contact");
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.name.trim()) x.name = "Tell me your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) x.email = "That email does not look right.";
    if (f.message.trim().length < 10) x.message = "A few more words, at least 10 characters.";
    setErr(x);
    if (Object.keys(x).length) return;
    scene.sendAt = -2; // the paper plane takes off
    setDone(true);
    const body = `${f.message}\n\n${f.name} <${f.email}>`;
    setTimeout(() => {
      window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(body)}`;
    }, 900);
  };
  return (
    <div className="page contact">
      <div className="col">
        <p className="eyebrow">Contact</p>
        <h1 id="h1" className="title">
          <Kinetic text="Let us talk" />
        </h1>
        <p className="muted measure">Internships, collaborations, a hard problem, or just a hello.</p>
        <div className="actions">
          <Magnetic href={`mailto:${PROFILE.email}`} cursor="Write to me">
            {PROFILE.email}
          </Magnetic>
          <Magnetic href={PROFILE.linkedin} className="btn ghost" cursor="LinkedIn">
            LinkedIn
          </Magnetic>
          <Magnetic href={PROFILE.github} className="btn ghost" cursor="GitHub">
            GitHub
          </Magnetic>
        </div>
        <form onSubmit={submit} noValidate aria-label="Message form" className="form">
          {(["name", "email", "message"] as const).map((k) => (
            <label key={k}>
              <span>{k[0].toUpperCase() + k.slice(1)}</span>
              {k === "message" ? (
                <textarea rows={4} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!err[k]} />
              ) : (
                <input type={k === "email" ? "email" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!err[k]} autoComplete={k} />
              )}
              {err[k] && <em role="alert">{err[k]}</em>}
            </label>
          ))}
          <button className="btn" type="submit">
            Send the plane
          </button>
          <p className="muted small" role="status">
            {done ? "Thank you. Your email app is opening with the message ready to send." : "This opens your email app with the message filled in. Nothing is sent from this page."}
          </p>
        </form>
      </div>
    </div>
  );
}
