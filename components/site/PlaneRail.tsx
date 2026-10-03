"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONSOLE, PLANE } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The Control Plane rail — the site skeleton.
 *
 * The rail lists the five nodes of the system in the order reality moves
 * through them, which is not the same as menu order: it is a reading
 * order for a system, so a first-time visitor is walked Field →
 * Register → Intelligence → Control → Evidence and ends up holding the
 * architecture in their head without having read a paragraph.
 *
 * Every node is a live route. The ordinal marks position in the system,
 * not a bullet, which is why it is set in the mono register.
 *
 * `/console` sits below the plane, separated, because it is a product
 * surface that runs on this architecture rather than a stage of it.
 */
export function PlaneRail() {
  const pathname = usePathname();

  return (
    <nav className="plane-rail" aria-label="Control plane">
      <Link href="/" className="plane-wordmark">
        APT-LABS
      </Link>

      <div className="plane-nav">
        {PLANE.map((node) => {
          const current =
            node.href === "/"
              ? pathname === "/"
              : pathname === node.href || pathname.startsWith(`${node.href}/`);
          return (
            <Link
              key={node.key}
              href={node.href}
              className="plane-node"
              aria-current={current ? "page" : undefined}
            >
              <span className="plane-node-ord">{node.ord}</span>
              <span className="plane-node-name">{node.name}</span>
              <span className="plane-node-role">{node.role}</span>
            </Link>
          );
        })}
      </div>

      <div className="plane-foot">
        <Link className="plane-node" href={CONSOLE.href}>
          <span className="plane-node-ord">◆</span>
          <span className="plane-node-name">{CONSOLE.name}</span>
          <span className="plane-node-role">The first field implementation. Runs on this device.</span>
        </Link>
        <div style={{ paddingTop: 6 }}>
          <StateTag state={CONSOLE.state} title={CONSOLE.provenance} />
        </div>
      </div>
    </nav>
  );
}