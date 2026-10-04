import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stack } from './stack';

describe('Stack', () => {
  it('is a column of children, a small gap apart, by default', () => {
    render(<Stack data-testid="stack">child</Stack>);
    const stack = screen.getByTestId('stack');
    expect(stack.tagName).toBe('DIV');
    expect(stack.className).toBe('layout-stack layout-stack-gap-sm');
    expect(stack).toHaveTextContent('child');
  });

  it('maps each prop onto its class', () => {
    render(
      <Stack data-testid="stack" direction="row" gap="0" align="center" justify="between" wrap />,
    );
    expect(screen.getByTestId('stack').className).toBe(
      'layout-stack layout-stack-row layout-stack-gap-0 layout-stack-align-center ' +
        'layout-stack-justify-between layout-stack-wrap',
    );
  });

  it('keeps a consumer className and passes other props through', () => {
    render(<Stack className="mine" aria-label="Actions" role="group" />);
    const stack = screen.getByRole('group', { name: 'Actions' });
    expect(stack).toHaveClass('layout-stack', 'mine');
  });

  it('renders another element through render', () => {
    render(
      <Stack render={<ul />} gap="2xs">
        <li>One</li>
      </Stack>,
    );
    const list = screen.getByRole('list');
    expect(list).toHaveClass('layout-stack', 'layout-stack-gap-2xs');
  });
});
