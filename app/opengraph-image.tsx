import { ImageResponse } from "next/og";
import { COMPANY } from "@/lib/system";

/**
 * The link preview — the one surface read out of context.
 *
 * A share card is where a claim travels furthest from its evidence
 * state, so this one carries the product sentence and the PROTOTYPE
 * declaration side by side. No metrics, no logos of things that do not
 * exist, no imagery that implies a deployment: the same rule the site
 * applies, applied where it matters most.
 *
 * Rendered by Satori (default bundled font — zero network at build or
 * request time, in keeping with the self-hosted type register).
 */
export const alt = `${COMPANY.name} — ${COMPANY.primary} (prototype)`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Satori runs on the edge runtime here: it is the deployment target's
// native runtime for image generation, and it sidesteps the Node
// build's path resolution, which breaks on Windows hosts.
export const runtime = "edge";


const NODES = ["01 Field", "02 Register", "03 Intelligence", "04 Control", "05 Evidence"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f6f6f4",
          color: "#14181c",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(22,26,30,0.30)",
            paddingBottom: 22,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6 }}>
            APT-LABS
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 20,
              letterSpacing: 3,
              color: "#39414a",
              border: "1px solid rgba(22,26,30,0.30)",
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                border: "1.5px solid #0a7549",
                transform: "rotate(45deg)",
              }}
            />
            PROTOTYPE — NOT DEPLOYED
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
            maxWidth: 980,
          }}
        >
          <div style={{ display: "flex", fontSize: 54, lineHeight: 1.12 }}>
            {COMPANY.primary}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 26,
              lineHeight: 1.45,
              color: "#39414a",
            }}
          >
            {COMPANY.supporting}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid rgba(22,26,30,0.30)",
            paddingTop: 22,
            fontSize: 19,
            letterSpacing: 2,
            color: "#39414a",
          }}
        >
          {NODES.map((node, i) => (
            <div
              key={node}
              style={{
                display: "flex",
                flexGrow: 1,
                justifyContent: i === 0 ? "flex-start" : "center",
                borderLeft: i === 0 ? "none" : "1px solid rgba(22,26,30,0.16)",
              }}
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
