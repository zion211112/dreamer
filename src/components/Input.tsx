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
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onInput={(e: Event) => onChange?.((e.target as HTMLInputElement).value)}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      id={id}
      name={name}
      autoComplete={autoComplete}
      min={min}
      step={step}
      className={`input ${className}`}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
    />
  );
}
