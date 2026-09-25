import Link from "next/link";
import { FACE_SURFACE_CLASS, FACE_SURFACES, type Face } from "../lib/company";

export function FaceSurface({ face }: { face: Face }) {
  const content = FACE_SURFACES[face.key];
  return (
    <section className={`face-surface ${FACE_SURFACE_CLASS[face.key]}`} aria-label={`${face.name} visual system`}>
      <div className="face-surface-head">
        <p className="lp-label">{content.eyebrow}</p>
        <span className="face-surface-state">{face.status}</span>
      </div>
      <div className="face-surface-copy">
        <h2>{content.title}</h2>
        <p>{content.body}</p>
        <Link href={content.action.href} className="face-surface-link">
          {content.action.label} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ol className="face-surface-stages">
        {content.stages.map((stage) => (
          <li key={stage.label}>
            <span>{stage.label}</span>
            <strong>{stage.value}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
