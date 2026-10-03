import { ImageResponse } from "next/og";

/**
 * Apple touch icon — same mark as app/icon.svg, rendered as PNG because
 * iOS ignores SVG favicons. Paper ground, one rule, the diamond: the
 * smallest complete statement of the register grammar.
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
          background: "#f6f6f4",
        }}
      >
        <div style={{ display: "flex", width: 132, height: 1, background: "#14181c" }} />
        <div
          style={{
            display: "flex",
            width: 56,
            height: 56,
            margin: "22px 0",
            border: "6px solid #0a7549",
            transform: "rotate(45deg)",
          }}
        />
        <div style={{ display: "flex", width: 132, height: 1, background: "#14181c" }} />
      </div>
    ),
    size
  );
}
