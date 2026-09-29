import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tooltip } from './index';

// Opening needs hover, :focus-visible and the popover API: behaviour is in
// tooltip.browser.spec.tsx. These cover what renders while closed.
describe('Tooltip (closed, jsdom)', () => {
  it('renders a closed manual popover describing a native trigger button', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>Save</Tooltip.Trigger>
        <Tooltip.Popup data-testid="tip">Saves the draft</Tooltip.Popup>
      </Tooltip.Root>,
    );
    const tip = screen.getByTestId('tip');
    expect(tip).toHaveAttribute('popover', 'manual');
    expect(tip).toHaveAttribute('role', 'tooltip');
    expect(tip).toHaveAttribute('data-closed');
    expect(tip).toHaveAttribute('data-side', 'top');

    const trigger = screen.getByText('Save');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-describedby', tip.id);
    expect(trigger.getAttribute('style')).toMatch(/anchor-name: --hl-anchor-/);
  });

  it.each(['Trigger', 'Popup'] as const)(
    'throws when Tooltip.%s is outside Tooltip.Root',
    (part) => {
      const Part = Tooltip[part];
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Part />)).toThrow(
        `<Tooltip.${part}> must be rendered inside <Tooltip.Root>.`,
      );
    },
  );
});
