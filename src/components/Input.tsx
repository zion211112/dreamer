interface InputProps {
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  className?: string;
  style?: Record<string, string>;
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
  className = '',
  style = {},
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: InputProps) {
  const inputStyle: Record<string, string> = {
    width: '100%',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-3)',
    padding: 'var(--space-2) var(--space-3)',
    background: 'var(--bg-elev)',
    color: 'var(--text)',
    transition: 'border var(--fast), box-shadow var(--fast), background var(--fast)',
    ...style,
  };

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
      className={`input ${className}`}
      style={inputStyle}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
    />
  );
}
