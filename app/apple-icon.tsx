import { ImageResponse } from "next/og";

/**
 * Apple touch icon — same mark as app/icon.svg, rendered as PNG because
 * iOS ignores SVG favicons. Dark ground, one lit rule, an emitting
 * diamond: the smallest complete statement of the register grammar,
 * which is that light is what a record earns.
 *
 * The bloom is a second element rather than a filter: Satori has no
 * filter support, and a 40% stop at 62%/38% puts the glow on the
 * golden focal point the rest of the system uses.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const runtime = "edge";


export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#04060a",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 132,
            height: 1,
            background: "rgba(178,206,240,0.34)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 56,
            height: 56,
            margin: "22px 0",
            border: "6px solid #35d9a4",
            transform: "rotate(45deg)",
            boxShadow: "0 0 40px rgba(53,217,164,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 132,
            height: 1,
            background: "rgba(178,206,240,0.34)",
          }}
        />
      </div>
    ),
    size
  );
}
