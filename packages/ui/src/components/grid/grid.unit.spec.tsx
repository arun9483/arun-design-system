import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Grid } from './grid';

function grid() {
  return screen.getByTestId('grid');
}

describe('Grid', () => {
  it('is one column, a small gap apart, by default', () => {
    render(<Grid data-testid="grid" />);
    expect(grid().tagName).toBe('DIV');
    expect(grid().className).toBe('layout-grid layout-grid-gap-sm');
    expect(grid().style.getPropertyValue('--grid-columns')).toBe('1');
  });

  it('sets a fixed number of columns', () => {
    render(<Grid data-testid="grid" columns={3} gap="lg" />);
    expect(grid().className).toBe('layout-grid layout-grid-gap-lg');
    expect(grid().style.getPropertyValue('--grid-columns')).toBe('3');
    expect(grid().style.getPropertyValue('--grid-min-item-size')).toBe('');
  });

  it('fits as many columns as there is room for at minItemSize', () => {
    render(<Grid data-testid="grid" minItemSize="12rem" />);
    expect(grid()).toHaveClass('layout-grid-fit');
    expect(grid()).not.toHaveClass('layout-grid-fit-capped');
    expect(grid().style.getPropertyValue('--grid-min-item-size')).toBe('12rem');
    expect(grid().style.getPropertyValue('--grid-columns')).toBe('');
  });

  it('caps the fitted columns at columns', () => {
    render(<Grid data-testid="grid" minItemSize="12rem" columns={4} />);
    expect(grid()).toHaveClass('layout-grid-fit-capped');
    expect(grid()).not.toHaveClass('layout-grid-fit');
    expect(grid().style.getPropertyValue('--grid-columns')).toBe('4');
  });

  it('sets its own columns when nested, never inheriting the outer grid', () => {
    render(
      <Grid columns={3}>
        <Grid data-testid="grid" />
      </Grid>,
    );
    expect(grid().style.getPropertyValue('--grid-columns')).toBe('1');
  });

  it('merges a consumer style, theirs winning', () => {
    render(
      <Grid
        data-testid="grid"
        columns={2}
        style={{ '--grid-columns': 5, marginBlock: '1rem' } as React.CSSProperties}
      />,
    );
    expect(grid().style.getPropertyValue('--grid-columns')).toBe('5');
    expect(grid().style.marginBlock).toBe('1rem');
  });

  it('renders another element through render', () => {
    render(
      <Grid render={<ul />} className="mine">
        <li>One</li>
      </Grid>,
    );
    expect(screen.getByRole('list')).toHaveClass('layout-grid', 'mine');
  });
});
