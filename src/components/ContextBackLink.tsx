type ContextBackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function ContextBackLink({ href, label, className = '' }: ContextBackLinkProps) {
  return (
    <a className={`context-back-link ${className}`.trim()} href={href}>
      {label}
    </a>
  );
}
