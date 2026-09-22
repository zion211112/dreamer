// The shared identity mark: a {7,3} hyperbolic tiling of the Poincaré disk.
// Every watermark surface (hero, contact, 404) renders the same artwork so
// the mark stays consistent across the site; `variant` only scales the depth
// to suit the surface it sits behind.

import HyperbolicHeptagon from "./HyperbolicHeptagon";

type Variant = "ring" | "grid" | "band" | "corner" | "cells";

// Larger, focal surfaces get a deeper (denser) tiling; small or quiet
// corner accents stay lighter so they read as a whisper, not a texture.
const depthFor: Record<Variant, number> = {
  cells: 2,   // hero — the focal moment
  ring: 2,    // 404 — centered behind the message
  grid: 2,
  band: 1,
  corner: 1   // contact — quiet corner accent
};

export default function GeoArt({
  variant = "ring",
  className = ""
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <HyperbolicHeptagon
      depth={depthFor[variant] ?? 2}
      className={className}
    />
  );
}
