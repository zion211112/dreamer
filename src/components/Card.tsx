import {
  Card as BaseCard,
  CardHead as BaseCardHead,
  CardBody as BaseCardBody,
  CardFoot as BaseCardFoot,
} from '@/components/ui/Card';

interface CardProps {
  children: any;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <BaseCard className={className}>{children}</BaseCard>;
}

interface CardHeadProps {
  children: any;
  className?: string;
}

export function CardHead({ children, className = '' }: CardHeadProps) {
  return <BaseCardHead className={className}>{children}</BaseCardHead>;
}

interface CardBodyProps {
  children: any;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <BaseCardBody className={className}>{children}</BaseCardBody>;
}

interface CardFootProps {
  children: any;
  className?: string;
}

export function CardFoot({ children, className = '' }: CardFootProps) {
  return <BaseCardFoot className={className}>{children}</BaseCardFoot>;
}
