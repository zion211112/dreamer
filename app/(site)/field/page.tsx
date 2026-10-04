import type { Metadata } from "next";
import { FieldSurface } from "@/components/epistem/FieldSurface";

export const metadata: Metadata = {
  title: "Field · APT-LABS",
  description: "Reality entering the system, and the fluency/evidence gap instrument.",
};

/**
 * The FIELD surface.
 *
 * ASIANCODER.MD asks for five primary surfaces rather than fourteen nav
 * items, and this is the first.
 *
 * Everything rendered here is DERIVED. The surface holds no figures of its
 * own: the gap comes from measureGap(), the axes from healthVector(), the
 * guards from guardStatement(), the distances from branchDistance(). If a
 * number appears here it exists because a function in lib/epistemic/
 * computed it from state the user can see and open.
 */
export default function FieldPage() {
  return (
    <>
      <FieldSurface />
    </>
  );
}
