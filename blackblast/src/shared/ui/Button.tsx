import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost';
};

/** shared: базовая кнопка */
export function Button({ variant = 'default', className = '', ...rest }: Props) {
  const v = variant === 'primary' ? ' primary' : variant === 'ghost' ? ' ghost' : '';
  return <button className={`btn${v} ${className}`} {...rest} />;
}
