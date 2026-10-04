"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUILT_LAYERS, COMPANY, CONSOLE, PRODUCTS, STACK } from "@/lib/system";
import { Identity } from "./Identity";
import { StateTag } from "./StateTag";

/**
 * The node index — this system's palette.
 *
 * A node-based workspace earns trust by letting you see every node it
 * can offer before you connect anything. This is that list, and it is
 * the site's entire navigation.
 *
 * Two groups, and the split is the most important thing on this page:
 *
 *   CONTROL PLANE  the five stages every record passes through, in
 *                  system order rather than menu order. All five are
 *                  live routes. This is the system, described.
 *   WHERE YOU CAN   the build floor and the roll. These are not
 *     ACT           descriptions — they are the two things a visitor
 *                  can actually DO, which is why they are in the
 *                  navigation at all.
 *
 * An earlier pass listed the six field builds here. That was a mistake
 * of category: they are not places to navigate to, they are instances
 * of the chain, and each one belongs to a field rather than to the
 * menu. They now live on the build floor, where a person can claim a
 * seat on one instead of merely reading its name.
 */
export function NodeIndex() {
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    /* One nav wrapping both groups: the navigation landmark describes
       the whole index, and the group headings are plain text inside it
       rather than extra nav landmarks, which would be noise for a
       screen reader announcing "navigation" three times per page. */
    <nav className="plane-index" aria-label="Node index">
      <Link href="/" className="plane-wordmark">
        <span className="plane-mark" aria-hidden="true" />
        APT-LABS
      </Link>

      {/* The company group, first in the rail.

          This is a deliberate reordering, and it is the third one this
          index has had, each for the same reason: navigation that opens
          with the architecture explains the company to a reader who has
          not yet been told what the company is.

          The first pass opened with "Control plane · the loop" — five
          architecture routes before anything a buyer would want. The
          second opened with "What we sell". This one opens with the two
          things a reader actually has questions about, in the order they
          are asked: what is being built (the stack, the one page that
          answers it), and what can be opened today (the product). The
          loop below them is the system those two run on. */}
      {/* ── ONE TAXONOMY, NOT TWO ───────────────────────────────────

          This rail previously listed "Sovereign stack" and "School
          Console", and then immediately underneath "THE SYSTEM · THE LOOP"
          with Field / Register / Intelligence / Control / Evidence — two
          different sets of five, about forty pixels apart, with no signal
          that they are different things. A visitor scrolling past would
          have taken them for one list of five and the company for having
          no idea what it is made of.

          So the loop is gone from the rail. It is not deleted: /lattice
          still draws it, and the five routes still exist, but a rail is a
          navigation and it should teach one structure. The stack is that
          structure — it is the company's own, it is what the homepage is
          about, and one lit stratum in twelve pixels is a better mark than
          an ordnance number.

          The loop is reachable from the stack page and from the foot. */}
      <div className="index-group">
        <p className="index-group-key">The stack</p>
        <ul className="index-list index-stack">
          {STACK.map((layer) => (
            <li key={layer.key} className="index-stack-row" data-built={layer.state === "PROTOTYPE" ? "true" : "false"}>
              <span className="index-stack-spine" aria-hidden="true" />
              <Link
                href="/stack"
                className="index-node"
                aria-current={isCurrent("/stack") ? "page" : undefined}
              >
                <span className="index-node-name">{layer.name}</span>
                {layer.alias ? (
                  <span className="index-stack-alias">{layer.alias}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="index-group">
        <p className="index-group-key">What can be opened</p>
        <ul className="index-list">
          <li>
            <Link
              href={CONSOLE.href}
              className="index-node"
              aria-current={isCurrent(CONSOLE.href) ? "page" : undefined}
            >
              {/* A lit port: this route has a product behind it, and it is
                  the one link in this rail that opens something a person
                  can actually run. */}
              <span className="port port--live" aria-hidden="true" />
              <span className="index-node-name">{CONSOLE.name}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/lattice"
              className="index-node"
              aria-current={pathname === "/lattice" ? "page" : undefined}
            >
              <span className="index-node-ord" aria-hidden="true">
                <span className="strata-mark" />
              </span>
              <span className="index-node-name">Lattice topology</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* The rail's foot. States the same count the strata margin states,
          in the rail's own terms — not a second taxonomy, and not a
          sentence about a loop that is no longer listed here. */}
      <p className="index-foot">
        Five layers. {BUILT_LAYERS.length} has a surface a person can run; the
        other {STACK.length - BUILT_LAYERS.length} are designs, and a design is
        not a capability.{" "}
        {PRODUCTS.length} products and tracks are catalogued on{" "}
        <Link href="/control">Control</Link>.
      </p>

      {/* The identity corner, and the one thing a reader can actually do.
          Both are last in the rail on purpose: everything above is a
          statement about the product, and these two are about the person
          reading it. The previous version of this footer read "Nowhere —
          the loop has no exit", which was a category error in nine
          characters — it declined to offer an action while calling the
          refusal a design. */}
      <div className="index-identity">
        <Identity />
      </div>

      <a className="index-cta" href={`mailto:${COMPANY.contact.email}`}>
        <span className="index-cta-key">Get in touch</span>
        <span className="index-cta-val">{COMPANY.contact.email}</span>
        <span className="index-cta-note">
          {COMPANY.contact.note} <StateTag state={COMPANY.contact.state} />
        </span>
      </a>

      <p className="index-foot index-foot--quiet">
        {COMPANY.kind}, {COMPANY.geography.scope.toLowerCase()} —{" "}
        {COMPANY.geography.value}. No customer, no deployment, no outcome
        record: <span className="figure">0 customers</span>, measured.
      </p>
    </nav>
  );
}