import { Input as BaseInput } from '@/components/ui/Input';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  min?: number;
  step?: number;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function Input({
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onBlur,
  disabled = false,
  required = false,
  id,
  name,
  autoComplete,
  min,
  step,
  className = '',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: InputProps) {
  const handleInput = (e: Event) => {
    onChange?.((e.target as HTMLInputElement).value);
  };

  return (
    <BaseInput
      type={type}
      placeholder={placeholder}
      value={value}
      onInput={handleInput}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      id={id}
      name={name}
      autoComplete={autoComplete}
      min={min}
      step={step}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
    />
  );
}
