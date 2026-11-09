interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

export function BrandMark({ size = 'md', className = '', href = '/' }: BrandMarkProps) {
  const sizes = {
    sm: { symbol: 24, text: '14px' },
    md: { symbol: 30, text: '12px' },
    lg: { symbol: 40, text: '20px' },
  };
  const { text } = sizes[size];
  const symbolClass = `wordmark-symbol wordmark-symbol-${size}`;
  return (
    <a
      className={`wordmark ${className}`.trim()}
      href={href}
      aria-label="APT-LABS"
    >
      <span className={symbolClass} aria-hidden="true">A</span>
      <span className="wordmark-dash" aria-hidden="true">â€”</span>
      <span className="wordmark-label" style={{ fontSize: text }}>Apt Labs</span>
    </a>
  );
}
