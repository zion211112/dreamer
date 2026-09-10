// Faded geometric furniture on obsidian. Twelve cells: ring, grid, band, corner.
// Opacity stays low: watermark, never noise.

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
  variant?: "ring" | "grid" | "band" | "corner";
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
