interface CardProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function Card({ children, className = '', style = {} }: CardProps) {
  return (
    <div className={`panel ${className}`} style={style}>
      {children}
    </div>
  );
}

interface CardHeadProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function CardHead({ children, className = '', style = {} }: CardHeadProps) {
  return (
    <div className={`panel-head ${className}`} style={style}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function CardBody({ children, className = '', style = {} }: CardBodyProps) {
  return (
    <div className={`panel-body ${className}`} style={style}>
      {children}
    </div>
  );
}

interface CardFootProps {
  children: any;
  className?: string;
  style?: Record<string, string>;
}

export function CardFoot({ children, className = '', style = {} }: CardFootProps) {
  return (
    <div className={`panel-foot ${className}`} style={style}>
      {children}
    </div>
  );
}
