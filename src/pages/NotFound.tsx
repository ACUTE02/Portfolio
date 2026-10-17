import { GoLink, Kinetic, usePage } from "../components/core";

export default function NotFound() {
  usePage("Not found", "lost");
  return (
    <div className="page lost">
      <div className="col">
        <p className="eyebrow">404</p>
        <h1 id="h1" className="title">
          <Kinetic text="This thread leads nowhere" />
        </h1>
        <p className="muted">The page you asked for is not here. The plane is circling while you pick another way.</p>
        <p>
          <GoLink to="/" className="btn">
            Back home
          </GoLink>
        </p>
      </div>
    </div>
  );
}
