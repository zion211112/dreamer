"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLANE } from "@/lib/system";

/**
 * The node map — the five stages of the system as a strip of ruled
 * stations.
 *
 * This is a map, not a diagram: each cell is a link to a real route and
 * the current stage is marked. The ruled vertical hairlines between cells
 * are the same material as the Register rows, so the navigation and the
 * evidence read as one grammar rather than two systems that happen to
 * share a colour palette.
 */
export function NodeMap() {
  const pathname = usePathname();

  return (
    <nav className="plane-map" aria-label="System nodes">
      {PLANE.map((node) => {
        const current =
          node.href === "/"
            ? pathname === "/"
            : pathname === node.href || pathname.startsWith(`${node.href}/`);
        return (
          <Link
            key={node.key}
            href={node.href}
            className="plane-map-cell"
            aria-current={current ? "page" : undefined}
          >
            <div className="plane-map-ord">{node.ord}</div>
            <div className="plane-map-name">{node.name}</div>
            <p className="plane-map-desc">{node.role}</p>
          </Link>
        );
      })}
    </nav>
  );
}