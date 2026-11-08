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
    <header className={`page-head ${className}`}>
      {eyebrow && (
        <div className="page-head-eyebrow">
          {eyebrow}
        </div>
      )}

      <div className="page-head-title-row">
        <h1 className="page-head-title">
          {title}
        </h1>

        {subtitle && (
          <p className="page-head-subtitle">
            {subtitle}
          </p>
        )}
      </div>

      {(primaryAction || quietActions.length > 0) && (
        <div className="page-head-actions">
          {primaryAction && (
            <Button
              variant="primary"
              size="md"
              className="page-head-primary-action"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
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
        <div className="page-head-metrics">
          {limitedMetrics.map((metric, index) => (
            <div
              key={index}
              className="page-head-metric"
            >
              <span className="page-head-metric-value">
                {metric.value}
              </span>
              <span className="page-head-metric-label">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
