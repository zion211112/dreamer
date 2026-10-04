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

  /* The homepage is NOT node 01.

     PLANE[0].href is "/", so the old match made the homepage a Field node
     and the rail rendered a full "SELECTED NODE / 01 / 05 Field" record —
     with Field's role, its custody and its provenance — on the one page
     that is about the company rather than about the loop. It read as a
     live selection the reader had made, and it was the single most
     misleading element on the site.

     The loop is five routes: /register, /intelligence, /control, /evidence
     and /lattice. The homepage is not one of them, so it has no node, so
     the panel renders nothing. Same for /stack and /product.

     Returned rather than filled in, because a rail panel that names
     something the reader did not choose is worse than no panel — and on a
     page whose subject is evidence discipline it is the one element on
     screen making a false claim. */
  const node = PLANE.find(
    (n) => n.href !== "/" && (pathname === n.href || pathname.startsWith(`${n.href}/`))
  );

  /* A route that is not one of the five has no node of its own, and
     falling back to PLANE[0] would put "01 / 05 Field" in the rail on a
     page about something else — which is the same category of error as
     the dead link this system exists to prevent, in the other
     direction. So the rail says what it does not know.

     It says it at P4. "None" is not a node, and setting an absence in the
     22.6px display register that the five real node names use would put a
     missing fact at the top of the page's most persistent surface. The
     evidence state is named rather than linked to a definition of one,
     because there is no state on this route to define. */
  if (!node) {
    /* Return nothing rather than an explanation.

       This rendered a panel headed "SELECTED NODE" showing "01 / 05 Field"
       and Field's role — on the homepage, and on every route that is not one
       of the five loop stages. It did that because `node` was resolved as a
       fallback to PLANE[0], so the rail confidently described a node the
       reader had not selected and could not select.

       A rail panel that names something you did not choose is worse than
       no panel: it reads as a live selection, and on a page whose subject
       is evidence discipline it is the one element on screen making a
       false claim. The lattice has its own record for its own selection, so
       nothing is lost where a record is actually wanted. */
    return null;
  }

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