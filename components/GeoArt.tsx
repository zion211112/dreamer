// Quiet geometric studies used as architectural watermarks.

function Cells12({ r = 140, cx = 200, cy = 200, cr = 13 }: { r?: number; cx?: number; cy?: number; cr?: number }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (Math.PI / 6) * i;
        return (
          <circle
            key={i}
            cx={cx + r * Math.cos(a)}
            cy={cy + r * Math.sin(a)}
            r={cr}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        );
      })}
    </>
  );
}

export default function GeoArt({
  variant = "ring",
  className = ""
}: {
  variant?: "ring" | "grid" | "band" | "corner" | "cells";
  className?: string;
}) {
  if (variant === "grid") {
    // Twelve-cell watermark grid: 4 cols x 3 rows
    return (
      <svg className={className} viewBox="0 0 480 360" fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 60 + col * 120;
          const y = 60 + row * 120;
          return (
            <g key={i}>
              <rect x={x - 40} y={y - 40} width={80} height={80} stroke="currentColor" strokeWidth="1" />
              <circle cx={x} cy={y} r={22} stroke="currentColor" strokeWidth="1" />
              <circle cx={x} cy={y} r={3} fill="currentColor" />
            </g>
          );
        })}
      </svg>
    );
  }
  if (variant === "band") {
    return (
      <svg className={className} viewBox="0 0 600 60" fill="none" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <rect x={20 + i * 48} y={18} width={24} height={24} stroke="currentColor" strokeWidth="1" />
            <circle cx={32 + i * 48} cy={30} r={5} stroke="currentColor" strokeWidth="1" />
          </g>
        ))}
      </svg>
    );
  }
  if (variant === "corner") {
    return (
      <svg className={className} viewBox="0 0 160 160" fill="none" aria-hidden>
        <circle cx="160" cy="0" r="150" stroke="currentColor" strokeWidth="1" />
        <circle cx="160" cy="0" r="110" stroke="currentColor" strokeWidth="1" />
        <circle cx="160" cy="0" r="70" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (Math.PI / 6) * i + Math.PI / 2;
          return (
            <circle
              key={i}
              cx={160 + 110 * Math.cos(a)}
              cy={0 + 110 * Math.sin(a)}
              r={7}
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  }
  if (variant === "cells") {
    return (
      <svg className={className} viewBox="0 0 800 800" fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
        <circle cx="400" cy="400" r="292" stroke="currentColor" strokeWidth="1" />
        <circle cx="400" cy="400" r="208" stroke="currentColor" strokeWidth="1" />
        <circle cx="400" cy="400" r="112" stroke="currentColor" strokeWidth="1" />
        <circle cx="400" cy="400" r="5" fill="currentColor" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (Math.PI / 6) * i;
          const outerX = 400 + 292 * Math.cos(a);
          const outerY = 400 + 292 * Math.sin(a);
          const innerX = 400 + 112 * Math.cos(a);
          const innerY = 400 + 112 * Math.sin(a);
          return (
            <g key={i}>
              <path d={`M400 400L${outerX} ${outerY}`} stroke="currentColor" strokeWidth="1" />
              <circle cx={400 + 208 * Math.cos(a)} cy={400 + 208 * Math.sin(a)} r="26" stroke="currentColor" strokeWidth="1" />
              <circle cx={innerX} cy={innerY} r="7" fill="currentColor" />
            </g>
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (Math.PI / 6) * i;
          return (
            <circle
              key={i}
              cx={400 + 292 * Math.cos(a)}
              cy={400 + 292 * Math.sin(a)}
              r="9"
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" aria-hidden>
      <circle cx="200" cy="200" r="188" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="200" r="92" stroke="currentColor" strokeWidth="1" />
      <Cells12 />
      <circle cx="200" cy="200" r="4" fill="currentColor" />
    </svg>
  );
}
