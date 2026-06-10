import React from 'react';

type CardProps = {
  as?: React.ElementType;
  lift?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Card({ as: Tag = 'div', lift, className, children }: CardProps) {
  const cls = ['card', lift && 'card-lift', className].filter(Boolean).join(' ');
  return <Tag className={cls}>{children}</Tag>;
}
