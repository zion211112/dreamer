interface CardProps {
  children: any;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`panel ${className}`}>
      {children}
    </div>
  );
}

interface CardHeadProps {
  children: any;
  className?: string;
}

export function CardHead({ children, className = '' }: CardHeadProps) {
  return (
    <div className={`panel-head ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: any;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`panel-body ${className}`}>
      {children}
    </div>
  );
}

interface CardFootProps {
  children: any;
  className?: string;
}

export function CardFoot({ children, className = '' }: CardFootProps) {
  return (
    <div className={`panel-foot ${className}`}>
      {children}
    </div>
  );
}
