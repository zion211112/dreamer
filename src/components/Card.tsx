interface CardProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function Card({ children, className = '', style = {} }: CardProps) {
  const cardStyle: Record<string, string> = {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-4)',
    background: 'var(--bg-elev)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-1)',
    ...style,
  };

  return (
    <div className={`panel ${className}`} style={cardStyle}>
      {children}
    </div>
  );
}

interface CardHeadProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function CardHead({ children, className: _className = '', style = {} }: CardHeadProps) {
  return (
    <div className="panel-head" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-subtle)',
      ...style,
    }}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function CardBody({ children, className: _className = '', style = {} }: CardBodyProps) {
  return (
    <div className="panel-body" style={{
      padding: 'var(--space-4)',
      ...style,
    }}>
      {children}
    </div>
  );
}

interface CardFootProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function CardFoot({ children, className: _className = '', style = {} }: CardFootProps) {
  return (
    <div className="panel-foot" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-4)',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-subtle)',
      fontSize: 'var(--step--1)',
      color: 'var(--text-muted)',
      ...style,
    }}>
      {children}
    </div>
  );
}
