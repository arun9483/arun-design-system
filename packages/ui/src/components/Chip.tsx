import React from 'react';

type ChipVariant = 'default' | 'accent';

type ChipProps = {
  as?: 'span' | 'button';
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
};

export function Chip({
  as = 'span',
  variant = 'default',
  className,
  onClick,
  type,
  children,
}: ChipProps) {
  const variantClass = variant === 'accent' ? 'chip chip-accent' : 'chip chip-default';
  const combined = className ? `${variantClass} ${className}` : variantClass;
  if (as === 'button') {
    return (
      <button className={combined} onClick={onClick} type={type ?? 'button'}>
        {children}
      </button>
    );
  }
  return <span className={combined}>{children}</span>;
}
