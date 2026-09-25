import Link from "next/link";
import { CONSOLE_MODULES, CONSOLE_TOOLS } from "../lib/console";
import { FACES, FACE_SURFACES } from "../lib/company";

/**
 * A code-native view of the existing local console registry. It deliberately
 * does not pretend to be a screenshot, a deployment or a live institution.
 */
export default function DeployPreview() {
  const surface = FACE_SURFACES.deploy;
  return (
    <section className="deploy-preview" aria-labelledby="deploy-preview-title">
      <div className="deploy-preview-chrome">
        <div className="deploy-preview-brand">
          <span className="deploy-preview-mark" aria-hidden="true">A</span>
          <span>APT DEPLOY</span>
        </div>
        <span className="deploy-preview-state">{FACES.deploy.status}</span>
      </div>

      <div className="deploy-preview-body">
        <div className="deploy-preview-heading">
          <p className="lp-label">Device-local working surface</p>
          <h2 id="deploy-preview-title">{surface.title}</h2>
          <p>{surface.body}</p>
        </div>

        <dl className="deploy-preview-facts">
          <div>
            <dt>Session</dt>
            <dd>LOCAL</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>NOT REQUIRED</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>ON DEVICE</dd>
          </div>
        </dl>

        <div className="deploy-preview-modules">
          <div className="deploy-preview-section-head">
            <span>Current module set</span>
            <span>{CONSOLE_MODULES.length} modules</span>
          </div>
          <ol>
            {CONSOLE_MODULES.slice(0, 6).map((module, index) => (
              <li key={module}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{module}</strong>
              </li>
            ))}
          </ol>
        </div>

        <div className="deploy-preview-footer">
          <div>
            <span className="deploy-preview-footer-label">Evidence boundary</span>
            <strong>{surface.boundary}</strong>
            <span>{CONSOLE_TOOLS.length} tools are defined in the current prototype registry.</span>
          </div>
          <Link href="/console" className="deploy-preview-link">
            Open local console <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
