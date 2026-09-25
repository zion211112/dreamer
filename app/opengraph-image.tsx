import { ImageResponse } from "next/og";

// The Node runtime's @vercel/og binding fails to resolve its wasm/fonts on
// Windows hosts ("Invalid URL" at module load). The edge runtime has no
// filesystem to resolve and renders the same markup via wasm.
export const runtime = "edge";

export const alt = "APT-LABS — Locally owned institutional infrastructure systems.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors globals.css tokens. Keep in sync if the palette moves.
const VOID = "#060708";
const SIGNAL = "#14B8A6";
const INK = "#EDEAE4";
const DUST = "#857F7A";
const RULE = "#26292B";

function Ring({ r, color = RULE }: { r: number; color?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        width: r * 2,
        height: r * 2,
        left: 900 - r,
        top: 315 - r,
        borderRadius: 999,
        border: `1px solid ${color}`,
        display: "flex",
      }}
    />
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          backgroundColor: VOID,
          color: INK,
        }}
      >
        {/* ring motif, right side — echoes the GeoArt watermark system */}
        <Ring r={250} />
        <Ring r={170} />
        <Ring r={92} />
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            left: 894,
            top: 309,
            borderRadius: 999,
            backgroundColor: SIGNAL,
            display: "flex",
          }}
        />

        {/* header strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 6,
            color: DUST,
          }}
        >
          <div style={{ display: "flex" }}>KIRINYAGA · KENYA</div>
          <div style={{ display: "flex" }}>PUBLIC RECORD</div>
        </div>

        {/* title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 8,
              color: SIGNAL,
            }}
          >
            APT-LABS
          </div>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>
            Locally owned institutional infrastructure.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: DUST }}>
            Counts are visible. Identity stays yours.
          </div>
        </div>

        {/* footer strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${RULE}`,
            paddingTop: 28,
            fontSize: 22,
            letterSpacing: 4,
            color: DUST,
          }}
        >
          <div style={{ display: "flex", color: INK }}>ONE SYSTEM · FOUR FACES</div>
          <div style={{ display: "flex" }}>DEPLOY · FAB · STUDIO · ROLL</div>
        </div>
      </div>
    ),
    size
  );
}
