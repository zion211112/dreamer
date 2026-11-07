interface RingedEvidenceMarkerProps {
  size?: number;
  className?: string;
  color?: string;
  filled?: boolean;
}

/**
 * Ringed evidence marker (● with ring) � marks events/records with evidence.
 * Used on: Roll entries, Annals events, Workbench stage gates, Network relationship hypotheses.
 */
export function RingedEvidenceMarker({ size = 12, className = '', color, filled = false }: RingedEvidenceMarkerProps) {
  const strokeColor = color || 'var(--state-canon)';
  const fillColor = filled ? strokeColor : 'transparent';
  return (
    <svg
      aria-hidden="true"
      className={`ringed-evidence-marker ${className}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="10"
        cy="10"
        r={size / 2 - 1}
        stroke={strokeColor}
        strokeWidth="1.5"
        fill={fillColor}
      />
      {filled && (
        <circle
          cx="10"
          cy="10"
          r={size / 6}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}

export type { RingedEvidenceMarkerProps };
