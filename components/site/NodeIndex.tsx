"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUILDS, PLANE } from "@/lib/system";

/**
 * The node index — this system's palette.
 *
 * A node-based workspace earns trust by letting you see every node it
 * can offer before you connect anything. This is that list, and it is
 * the site's entire navigation.
 *
 * Two groups, because there are two kinds of thing here and conflating
 * them is what turns a workspace into a menu:
 *
 *   CONTROL PLANE  the five stages every record passes through, in
 *                  system order rather than menu order. All five are
 *                  live routes.
 *   FIELD BUILDS   the same seven-stage chain instantiated in six
 *                  domains. One of them is built; five are stated
 *                  architectures.
 *
 * The build list is the honest part. The School Console is an example
 * of the grammar, not the product: it is listed first only because it
 * is the only one with a surface to open. The five planned builds
 * render as *not links* — a hollow mark rather than a filled one — and
 * they are never styled as something you can click, because they are
 * not. That distinction is the whole reason this system's grammar
 * exists, and it is cheaper to keep it honest in the navigation than to
 * apologise for it later.
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
        <p className="index-group-key">
          Field builds · {BUILDS.filter((b) => b.href).length} live ·{" "}
          {BUILDS.filter((b) => !b.href).length} planned
        </p>
        <ul className="index-list">
          {BUILDS.map((build) =>
            build.href ? (
              <li key={build.name}>
                <Link href={build.href} className="index-node">
                  <span className="index-node-ord" aria-hidden="true">
                    <span className="port port--live" />
                  </span>
                  <span className="index-node-name">{build.name}</span>
                </Link>
              </li>
            ) : (
              /* Not a link. There is no route, so there is nothing to
                 promise — and a planned build that looks clickable is
                 the exact failure this system is built to prevent. */
              <li key={build.name}>
                <span className="index-node index-node--planned">
                  <span className="index-node-ord" aria-hidden="true">
                    <span className="port port--planned" />
                  </span>
                  <span className="index-node-name">{build.name}</span>
                </span>
              </li>
            )
          )}
        </ul>
      </div>

<p className="index-foot">
        A build is the same chain in a different domain. The console is
        an example of the grammar, not the grammar itself.
      </p>
    </nav>
  );
}