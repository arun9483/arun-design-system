import React from 'react';

type ButtonVariant = 'ghost' | 'primary';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: never;
  type?: never;
  disabled?: never;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: never;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button({ variant = 'ghost', className, children, href, ...rest }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn btn-primary' : 'btn btn-ghost';
  const combined = className ? `${variantClass} ${className}` : variantClass;

  if (href !== undefined) {
    const { target, rel } = rest as ButtonAsLink;
    return (
      <a href={href} className={combined} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  const { onClick, type = 'button', disabled } = rest as ButtonAsButton;
  return (
    <button className={combined} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
