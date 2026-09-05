import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary';
};

/** shared: базовая кнопка */
export function Button({ variant = 'default', className = '', ...rest }: Props) {
  return <button className={`btn${variant === 'primary' ? ' primary' : ''} ${className}`} {...rest} />;
}
