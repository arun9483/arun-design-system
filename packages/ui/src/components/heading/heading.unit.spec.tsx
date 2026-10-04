import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from './heading';

describe('Heading', () => {
  it('is an <h2> at the size for its level by default', () => {
    render(<Heading>Billing</Heading>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Billing' });
    expect(heading.tagName).toBe('H2');
    expect(heading.className).toBe('heading text-size-3xl');
  });

  it.each([
    [1, '4xl'],
    [2, '3xl'],
    [3, '2xl'],
    [4, 'xl'],
    [5, 'lg'],
    [6, 'base'],
  ] as const)('renders level %i as its element, at %s', (level, size) => {
    render(<Heading level={level}>Title</Heading>);
    const heading = screen.getByRole('heading', { level });
    expect(heading.tagName).toBe(`H${level}`);
    expect(heading).toHaveClass(`text-size-${size}`);
  });

  it('keeps the level when size changes the look', () => {
    render(
      <Heading level={2} size="lg" className="mine">
        Small, still a section
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toBe('heading text-size-lg mine');
  });

  it('renders another element through render', () => {
    render(<Heading render={<legend />}>Plan</Heading>);
    expect(screen.getByText('Plan').tagName).toBe('LEGEND');
  });
});
