import { PlaneRail } from "@/components/site/PlaneRail";

/**
 * The Control Plane layout — the site skeleton shared by every route.
 *
 * The rail is a client component (it reads the current path to mark
 * location); everything else renders on the server. The `<main>` carries
 * the skip-link target so keyboard users land on content, not on
 * navigation, and the rail is marked `aria-label`ed so it is announced
 * as navigation rather than as a list of loose links.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="plane">
      <PlaneRail />
      <main className="plane-main" id="main-content">
        {children}
      </main>
    </div>
  );
}