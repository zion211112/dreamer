import { Button } from './Button';

export interface PageHeadMetric {
  label: string;
  value: string | number;
  state?: 'canon' | 'proposed' | 'risk' | 'caution';
}

export interface PageHeadQuietAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface PageHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  quietActions?: PageHeadQuietAction[];
  metrics?: PageHeadMetric[];
  className?: string;
}

export function PageHead({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  quietActions = [],
  metrics = [],
  className = '',
}: PageHeadProps) {
  const limitedMetrics = metrics.slice(0, 3);

  return (
    <header className={`page-head ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {eyebrow && (
        <div className="page-head-eyebrow" style={{
          fontFamily: 'var(--eyebrow-font)',
          fontSize: 'var(--eyebrow-size)',
          fontWeight: 'var(--eyebrow-weight)',
          lineHeight: 'var(--eyebrow-line)',
          letterSpacing: 'var(--eyebrow-tracking)',
          color: 'var(--eyebrow-color)',
          textTransform: 'uppercase',
        }}>
          {eyebrow}
        </div>
      )}

      <div className="page-head-title-row" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h1 className="page-head-title" style={{
          fontFamily: 'var(--l1-font)',
          fontSize: 'var(--l1-size)',
          fontWeight: 'var(--l1-weight)',
          lineHeight: 'var(--l1-line)',
          letterSpacing: 'var(--l1-tracking)',
          color: 'var(--fg)',
          margin: 0,
        }}>
          {title}
        </h1>

        {subtitle && (
          <p className="page-head-subtitle" style={{
            fontFamily: 'var(--l2-font)',
            fontSize: 'var(--l2-size)',
            fontWeight: 'var(--l2-weight)',
            lineHeight: 'var(--l2-line)',
            letterSpacing: 'var(--l2-tracking)',
            color: 'var(--l2-color)',
            margin: 0,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {(primaryAction || quietActions.length > 0) && (
        <div className="page-head-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
          {primaryAction && (
            <Button
              variant="primary"
              size="md"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              style={{ background: 'var(--state-proposed)', borderColor: 'var(--state-proposed)', color: 'var(--bg)' }}
            >
              {primaryAction.label}
            </Button>
          )}
          {quietActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="md"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {limitedMetrics.length > 0 && (
        <div className="page-head-metrics" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          {limitedMetrics.map((metric, index) => (
            <div
              key={index}
              className="page-head-metric"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                paddingLeft: 'var(--space-3)',
                borderLeft: '2px solid',
                borderLeftColor: index === 0 ? 'var(--state-canon)' : 'var(--line)',
                minWidth: '120px',
              }}
            >
              <span className="page-head-metric-value" style={{
                fontFamily: 'var(--l3-font)',
                fontSize: 'var(--l3-size)',
                fontWeight: 'var(--l3-weight)',
                lineHeight: 'var(--l3-line)',
                letterSpacing: 'var(--l3-tracking)',
                color: index === 0 ? 'var(--state-canon)' : 'var(--fg)',
              }}>
                {metric.value}
              </span>
              <span className="page-head-metric-label" style={{
                fontFamily: 'var(--l3-font)',
                fontSize: 'var(--l3-size-label)',
                fontWeight: 'var(--l3-weight-label)',
                lineHeight: '1',
                letterSpacing: 'var(--l3-tracking)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}>
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}