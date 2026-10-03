"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLANE } from "@/lib/system";

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

      <div className="index-group">
        <p className="index-group-key">Control plane · the loop</p>
        <ul className="index-list">
          {PLANE.map((node) => (
            <li key={node.key}>
              <Link
                href={node.href}
                className="index-node"
                aria-current={isCurrent(node.href) ? "page" : undefined}
              >
                <span className="index-node-ord figure">{node.ord}</span>
                <span className="index-node-name">{node.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

<div className="index-group">
        <p className="index-group-key">One view of it</p>
        <ul className="index-list">
          <li>
            <Link
              href="/lattice"
              className="index-node"
              aria-current={pathname === "/lattice" ? "page" : undefined}
            >
              {/* A mark, not an ordinal: this column otherwise holds a
                  sequence and this link is not one. `.glyph` exists
                  because the mono face does not carry the symbol, and the
                  mark is hidden because the name beside it says what the
                  link is. */}
              <span className="index-node-ord" aria-hidden="true">
                <span className="glyph">◆</span>
              </span>
              <span className="index-node-name">Lattice topology</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* There is no second group here any more. It held two links into the
          build floor and the roll, and both of those routes were discarded:
          a filled port on a link that resolves to nothing is the one failure
          this index's grammar exists to prevent, so the group went rather
          than the links. When there is somewhere a reader can act, it is
          listed here — and until then this is the site's whole navigation. */}
      <p className="index-foot">
        The five above are the system, and the view above them is the same
        system drawn. Nothing here is somewhere you can act yet: every
        route on this site describes the system rather than running it.
      </p>
    </nav>
  );
}