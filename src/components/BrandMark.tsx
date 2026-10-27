interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandMark({ size = 'md', className = '' }: BrandMarkProps) {
  const sizes = {
    sm: { symbol: 24, text: '14px' },
    md: { symbol: 30, text: '12px' },
    lg: { symbol: 40, text: '20px' },
  };
  const { symbol, text } = sizes[size];

  return (
    <a href="/" className={`wordmark ${className}`} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      color: 'var(--text)',
      font: `650 ${text}/1 var(--mono)`,
      letterSpacing: '.13em',
      textDecoration: 'none',
    }} aria-label="APT-LABS Home">
      <span className="wordmark-symbol" style={{
        display: 'grid',
        width: `${symbol}px`,
        height: `${symbol}px`,
        placeItems: 'center',
        border: '1px solid var(--border-strong)',
        borderRadius: '8px 8px 8px 2px',
        background: 'linear-gradient(145deg, var(--bg-elev), var(--terrain-pale))',
        color: 'var(--terrain-ink)',
        font: `600 ${size === 'sm' ? '12px' : size === 'lg' ? '20px' : '15px'} var(--serif)`,
      }}>
        A
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        APT<span className="wordmark-dash" style={{ color: 'var(--terrain)' }}>—</span>LABS
      </span>
    </a>
  );
}
