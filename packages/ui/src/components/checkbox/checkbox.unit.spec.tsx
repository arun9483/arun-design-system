import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Checkbox } from './index';

describe('Checkbox (styled)', () => {
  it('applies the design-system classes to both parts', () => {
    render(
      <Checkbox.Root data-testid="root">
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('checkbox');
    expect(screen.getByTestId('indicator')).toHaveClass('checkbox-indicator');
  });

  it('merges an additional className rather than replacing ours', () => {
    render(
      <Checkbox.Root className="shrink-0" data-testid="root">
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('checkbox', 'shrink-0');
  });

  it('keeps the behaviour it wraps — state reaches the DOM for CSS to read', () => {
    render(
      <Checkbox.Root data-testid="root">
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('indicator')).toHaveAttribute('data-unchecked');
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByTestId('indicator')).toHaveAttribute('data-checked');
  });

  it('ships both marks, so CSS can reveal either without a re-render', () => {
    const { container } = render(
      <Checkbox.Root>
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    // Present in every state — which one shows is decided by checkbox.css, keyed off
    // the data-* attributes on the Root.
    expect(container.querySelector('.checkbox-mark-check')).toBeInTheDocument();
    expect(container.querySelector('.checkbox-mark-dash')).toBeInTheDocument();
  });

  it('replaces both marks when the consumer supplies children', () => {
    const { container } = render(
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator>
          <span data-testid="custom">x</span>
        </Checkbox.Indicator>
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(container.querySelector('.checkbox-mark')).toBeNull();
  });

  it('keeps the marks out of the accessibility tree', () => {
    render(
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    // The Root announces the state; the marks are decoration.
    expect(screen.getByTestId('indicator')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('carries the indeterminate state through to the DOM', () => {
    render(
      <Checkbox.Root defaultChecked="indeterminate" data-testid="root">
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-indeterminate');
    expect(screen.getByTestId('indicator')).toHaveAttribute('data-indeterminate');
    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
  });
});
