interface ForkGlyphProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Fork glyph (└─) � identity mark for proposed change-sets.
 * Used in: Records revision lineage, Workbench simulation fork, Network relationship hypothesis.
 * Never in shell chrome, never as environment switcher.
 */
export function ForkGlyph({ size = 14, className = '', color }: ForkGlyphProps) {
  const strokeColor = color || 'currentColor';
  return (
    <svg
      aria-hidden="true"
      className={`fork-glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 10 2 L 10 10 L 15 15 M 10 10 L 5 15 M 10 10 L 10 18"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type { ForkGlyphProps };
