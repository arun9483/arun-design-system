import React from 'react';

type BadgeVariant =
  | 'default'
  | 'difficulty-beginner'
  | 'difficulty-intermediate'
  | 'difficulty-advanced';

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const variantClass = variant === 'default' ? 'chip badge' : `chip badge ${variant}`;
  const combined = className ? `${variantClass} ${className}` : variantClass;
  return <span className={combined}>{children}</span>;
}
