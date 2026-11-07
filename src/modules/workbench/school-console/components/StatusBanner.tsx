// src/modules/workbench/school-console/components/StatusBanner.tsx
// Local-data boundary disclosure — keeps the module honest about being
// browser-local, not a live school system.
interface StatusBannerProps {
  message: string;
  type?: 'info' | 'error';
}

export function StatusBanner({ message, type = 'info' }: StatusBannerProps) {
  const isError = type === 'error';
  return (
    <p
      className={`sc-state-line${isError ? ' is-error' : ''}`}
      role={isError ? 'alert' : 'status'}
    >
      {message}
    </p>
  );
}
