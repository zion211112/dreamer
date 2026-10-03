"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLANE } from "@/lib/system";
import { StateTag } from "./StateTag";

/**
 * The node record — what you have selected.
 *
 * A workspace that lets you connect nodes without ever showing you what
 * one node *is* is asking for trust it has not earned. So the current
 * selection is always described in the same four lines, in the same
 * place, on every route:
 *
 *   what it is      the role clause
 *   what it holds   one record, not a category
 *   who holds it    custody — the local-first claim made concrete
 *   why this state  the provenance of the state tag beside it
 *
 * The reason it is a `<dl>` and not a stack of paragraphs is that it is
 * four named facts, and a screen reader should be able to ask for them
 * one at a time.
 *
 * `UNKNOWN_FACTS`-style honesty applies here too: the last line links to
 * the route that explains what this node's state permits and forbids, so
 * no tag on this site is ever a label without a definition one click away.
 */
export function NodeRecord() {
  const pathname = usePathname();
  const node =
    PLANE.find((n) =>
      n.href === "/"
        ? pathname === "/"
        : pathname === n.href || pathname.startsWith(`${n.href}/`)
    ) ?? PLANE[0];

  return (
    <aside className="plane-record" aria-label="Selected node record">
      <p className="index-group-key">Selected node</p>

      <p className="record-ord figure">
        {node.ord} <span aria-hidden="true">/ 05</span>
      </p>
      <h2 className="record-name">{node.name}</h2>
      <p className="record-role">{node.role}</p>

      <dl className="record-fields">
        <div className="record-field">
          <dt>Holds</dt>
          <dd>{node.holds}</dd>
        </div>
        <div className="record-field">
          <dt>Custody</dt>
          <dd>{node.custody}</dd>
        </div>
        <div className="record-field">
          <dt>Provenance</dt>
          <dd>{node.provenance}</dd>
        </div>
      </dl>

      <div className="record-state">
        <StateTag state={node.state} />
        <Link href="/evidence" className="record-link">
          What {node.state.toLowerCase()} permits
        </Link>
      </div>
    </aside>
  );
}