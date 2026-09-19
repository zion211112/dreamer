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
  variant?: "ring" | "grid" | "band" | "corner" | "sacred";
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
  if (variant === "sacred") {
    return (
      <svg className={className} viewBox="0 0 800 800" fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
        <circle cx="400" cy="400" r="286" stroke="currentColor" strokeWidth="1" />
        <circle cx="400" cy="400" r="177" stroke="currentColor" strokeWidth="1" />
        <circle cx="400" cy="400" r="64" stroke="currentColor" strokeWidth="1" />
        <circle cx="400" cy="400" r="4" fill="currentColor" />
        <path d="M400 114V686M114 400H686" stroke="currentColor" strokeWidth="1" />
        <path d="M198 198L602 602M602 198L198 602" stroke="currentColor" strokeWidth="1" />
        <path d="M400 223L553 311V489L400 577L247 489V311L400 223Z" stroke="currentColor" strokeWidth="1" />
        <path d="M400 286L499 343V457L400 514L301 457V343L400 286Z" stroke="currentColor" strokeWidth="1" />
        <path d="M286 400C286 302 400 240 514 400C400 560 286 498 286 400Z" stroke="currentColor" strokeWidth="1" />
        <path d="M514 400C514 302 400 240 286 400C400 560 514 498 514 400Z" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (Math.PI / 6) * i;
          return (
            <circle
              key={i}
              cx={400 + 286 * Math.cos(a)}
              cy={400 + 286 * Math.sin(a)}
              r="8"
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
