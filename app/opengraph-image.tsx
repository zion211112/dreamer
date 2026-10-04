import { ImageResponse } from "next/og";
import { BUILT_LAYERS, COMPANY, STACK } from "@/lib/system";

/**
 * The link preview — the one surface read out of context.
 *
 * A share card is where a claim travels furthest from its evidence
 * state, so this one carries the mantra, the product sentence, and the
 * stack's own count side by side. The strip along the bottom is the five
 * layers of the stack, in dependency order, because the card is the only
 * place a reader meets the company's ontology before the site has a
 * chance to explain it. No metrics, no logos of things that do not
 * exist, no imagery that implies a deployment: the same rule the site
 * applies, applied where it matters most.
 *
 * Rendered by Satori (default bundled font — zero network at build or
 * request time, in keeping with the self-hosted type register).
 */
/**
 * The alt text describes the card's own content and nothing more. It does
 * not append "(prototype)" to the company name: only one of the five layers
 * is a prototype, and a single qualifier on the whole card would say the
 * other four are too — which is the exact category error this site exists
 * to avoid, repeated on the one surface read out of context.
 */
export const alt = `${COMPANY.name} — ${COMPANY.mantra} ${COMPANY.primary} ${BUILT_LAYERS.length} of ${STACK.length} layers built: ${STACK.map((l) => l.name).join(", ")}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Satori runs on the edge runtime here: it is the deployment target's
// native runtime for image generation, and it sidesteps the Node
// build's path resolution, which breaks on Windows hosts.
export const runtime = "edge";


const LAYERS = STACK.map((layer) => `${layer.ord} ${layer.name}`);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#04060a",
          color: "#edf1f6",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* The aura, cropped. A share card is the one surface this
            system is read out of context on, so it carries the same
            ground as the site — a dark plate with the field's light
            on it, placed on the same golden focal point. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -260,
            right: -180,
            width: 900,
            height: 900,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(53,217,164,0.20) 0%, rgba(53,217,164,0) 62%)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(178,206,240,0.22)",
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
              color: "#b4c1d0",
              border: "1px solid rgba(178,206,240,0.30)",
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 2,
                    background: i === 0 ? "#35d9a4" : "rgba(178,206,240,0.34)",
                  }}
                />
              ))}
            </div>
            {BUILT_LAYERS.length} OF {STACK.length} LAYERS BUILT
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
          {/* The mantra at display size, carrying the compression, with
              the full product sentence directly beneath it so the card
              is never read out of context as something it does not
              claim. Tracking is the ladder's own value at this size. */}
          <div
            style={{
              display: "flex",
              fontSize: 112,
              lineHeight: 0.94,
              letterSpacing: -3.2,
              color: "#edf1f6",
            }}
          >
            {COMPANY.mantra}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 26,
              lineHeight: 1.45,
              color: "#b4c1d0",
              maxWidth: 900,
            }}
          >
            {COMPANY.primary}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid rgba(178,206,240,0.22)",
            paddingTop: 22,
            fontSize: 19,
            letterSpacing: 2,
            color: "#8795a6",
          }}
        >
          {LAYERS.map((layer, i) => (
            <div
              key={layer}
              style={{
                display: "flex",
                flexGrow: 1,
                justifyContent: i === 0 ? "flex-start" : "center",
                borderLeft: i === 0 ? "none" : "1px solid rgba(178,206,240,0.14)",
              }}
            >
              {layer}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
