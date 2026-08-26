import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Switch } from './index';

describe('Switch (styled)', () => {
  it('applies the design-system classes to both parts', () => {
    render(
      <Switch.Root data-testid="root">
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('switch');
    expect(screen.getByTestId('thumb')).toHaveClass('switch-thumb');
  });

  it('merges an additional className rather than replacing ours', () => {
    render(
      <Switch.Root className="shrink-0" data-testid="root">
        <Switch.Thumb />
      </Switch.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('switch', 'shrink-0');
  });

  it('keeps the behaviour it wraps — state reaches the DOM for CSS to read', () => {
    render(
      <Switch.Root data-testid="root">
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>,
    );
    expect(screen.getByTestId('thumb')).toHaveAttribute('data-unchecked');
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByTestId('thumb')).toHaveAttribute('data-checked');
  });
});
