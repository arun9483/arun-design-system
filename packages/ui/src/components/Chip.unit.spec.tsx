import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>React</Chip>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('applies chip-default class by default', () => {
    render(<Chip>Tag</Chip>);
    const el = screen.getByText('Tag');
    expect(el).toHaveClass('chip', 'chip-default');
  });

  it('applies chip-accent class when variant is accent', () => {
    render(<Chip variant="accent">Tag</Chip>);
    const el = screen.getByText('Tag');
    expect(el).toHaveClass('chip', 'chip-accent');
  });

  it('merges additional className', () => {
    render(<Chip className="shrink-0">Tag</Chip>);
    expect(screen.getByText('Tag')).toHaveClass('shrink-0');
  });
});
