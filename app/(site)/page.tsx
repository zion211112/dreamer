import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../../components/GeoArt";
import { COMPANY, FACES, INTAKE, OPERATING_LOOP } from "../../lib/company";
import "../home.css";

export const metadata: Metadata = {
  title: { absolute: "APT-LABS — Locally owned institutional infrastructure systems." },
  description: COMPANY.oneSentence,
};

const faceList = Object.values(FACES);

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-system-strip">
        <div className="landing-frame landing-strip-inner">
          <span className="landing-status"><i aria-hidden="true" /> ONE COMPANY · FOUR FACES</span>
          <span>APT-LABS <b>/</b> INFRASTRUCTURE SYSTEMS</span>
          <span>OFFLINE-FIRST · LOCALLY OWNED · REPRODUCIBLE</span>
        </div>
      </div>
      <section className="landing-hero" aria-labelledby="landing-title">
        <GeoArt variant="cells" className="landing-hero-art" />
        <div className="landing-frame landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="lp-label">{COMPANY.geography.text} · Institutional infrastructure</p>
            <h1 id="landing-title" className="page-title">Locally owned institutional infrastructure.</h1>
            <p className="landing-lead">{COMPANY.oneSentence}</p>
            <div className="landing-actions">
              <Link href="/deploy" className="landing-button landing-button-primary">
                Inspect APT Deploy
              </Link>
              <Link href="/evidence" className="landing-button">
                See the evidence
              </Link>
            </div>
          </div>

          <aside className="landing-roll" aria-label="System protocol">
            <div className="landing-panel-head">
              <p className="lp-label">System protocol</p>
              <span className="landing-panel-code">OPEN</span>
            </div>
            <dl className="protocol-list">
              <div><dt>Problem</dt><dd>{COMPANY.problem}</dd></div>
              <div><dt>Faces</dt><dd>Deploy · Fab · Studio · Roll</dd></div>
              <div><dt>Evidence</dt><dd>State before scale</dd></div>
              <div><dt>Region</dt><dd>{COMPANY.geography.text}</dd></div>
            </dl>
            <p className="roll-total">No fabricated outcomes. Every result remains state-labelled.</p>
          </aside>
        </div>
      </section>

      <section className="landing-surfaces" aria-labelledby="faces-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="faces-title" className="lp-label">One system · Four faces</h2>
          </div>

          <ol className="surface-rows">
            {faceList.map((face, index) => (
              <li key={face.key} className="surface-row">
                <span className="surface-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="surface-text">
                  <h3>{face.name}</h3>
                  <p>{face.description} · State: {face.status}</p>
                </div>
                <Link href={face.route} className="surface-link">
                  Open face
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-surfaces" aria-labelledby="floor-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="floor-title" className="lp-label">Intake layer</h2>
          </div>
          <ol className="surface-rows">
            <li className="surface-row">
              <span className="surface-number" aria-hidden="true">+</span>
              <div className="surface-text">
                <h3>{INTAKE.name}</h3>
                <p>{INTAKE.summary} · State: {INTAKE.status}</p>
              </div>
              <Link href={INTAKE.route} className="surface-link">Enter intake</Link>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-surfaces" aria-labelledby="loop-title">
        <div className="landing-frame">
          <div className="landing-section-head">
            <h2 id="loop-title" className="lp-label">The scale loop</h2>
            <span>Method, not completed result</span>
          </div>
          <ol className="surface-rows">
            {OPERATING_LOOP.map((step, index) => (
              <li key={step} className="surface-row">
                <span className="surface-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="surface-text"><h3>{step}</h3></div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
