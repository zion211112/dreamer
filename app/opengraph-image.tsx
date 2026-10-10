import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#04123f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          color: "#ffffff",
        }}
      >
        <h1 style={{ fontSize: 72, fontWeight: 700, marginBottom: 24 }}>
          APT-LABS
        </h1>
        <p style={{ fontSize: 24, color: "#ea1013" }}>
          Locally Owned Institutional Infrastructure
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}