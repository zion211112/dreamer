import Link from "next/link";
import { FACES, INTAKE, REGISTERS } from "../lib/company";

const faceOrder = [FACES.deploy, FACES.fab, FACES.studio, FACES.roll];

/** A semantic, route-aware rendering of the public company architecture. */
export default function SystemMap() {
  return (
    <section className="system-map" aria-labelledby="system-map-title">
      <div className="system-map-header">
        <div>
          <p className="lp-label">Architecture — not a deployment record</p>
          <h2 id="system-map-title">One company. One ledger. One evidence model.</h2>
        </div>
        <p>
          Capability enters through the Floor, moves through an operational face,
          and becomes inspectable when The Roll records what happened.
        </p>
      </div>

      <div className="system-map-canvas">
        <div className="system-map-root">
          <span className="system-map-root-mark" aria-hidden="true">A</span>
          <span>APT-LABS</span>
          <small>ONE INFRASTRUCTURE SYSTEM</small>
        </div>

        <div className="system-map-connector system-map-connector--root" aria-hidden="true" />

        <nav className="system-map-faces" aria-label="APT-LABS operational faces">
          {faceOrder.map((face) => (
            <Link key={face.key} href={face.route} className="system-map-node system-map-node--face">
              <span className="system-map-node-index">{face.key === "deploy" ? "01" : face.key === "fab" ? "02" : face.key === "studio" ? "03" : "04"}</span>
              <strong>{face.name}</strong>
              <span>{face.oneLine}</span>
              <small>{face.status}</small>
            </Link>
          ))}
        </nav>

        <div className="system-map-connector system-map-connector--roll" aria-hidden="true" />

        <Link href="/roll" className="system-map-node system-map-node--roll">
          <span className="system-map-node-index">TRUST LAYER</span>
          <strong>The Roll</strong>
          <span>One sealing discipline for people and assets.</span>
          <small>{FACES.roll.status}</small>
        </Link>

        <div className="system-map-connector system-map-connector--registers" aria-hidden="true" />

        <div className="system-map-registers" aria-label="The Roll registers">
          {REGISTERS.map((register) => (
            <Link key={register.route} href={register.route} className="system-map-register">
              <span>{register.name}</span>
              <strong>{register.status}</strong>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        <div className="system-map-connector system-map-connector--floor" aria-hidden="true" />

        <Link href={INTAKE.route} className="system-map-node system-map-node--floor">
          <span className="system-map-node-index">INTAKE LAYER</span>
          <strong>{INTAKE.name}</strong>
          <span>Where local capability and work enter the system.</span>
          <small>{INTAKE.status}</small>
        </Link>
      </div>
    </section>
  );
}
