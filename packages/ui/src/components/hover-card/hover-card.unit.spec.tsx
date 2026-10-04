import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoverCard } from './index';
import { Link } from '../link';

// Behaviour, timing and placement are @arun-dev/headless's and are tested there, in a real
// browser. These check only what ui adds.
describe('HoverCard (ui)', () => {
  it('styles the card, keeping its placement props', () => {
    render(
      <HoverCard.Root>
        <HoverCard.Popup data-testid="card" className="wide" side="top">
          Ada Lovelace
        </HoverCard.Popup>
      </HoverCard.Root>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('hover-card', 'wide');
    expect(card).toHaveAttribute('popover', 'manual');
    expect(card).toHaveAttribute('data-side', 'top');
  });

  it('takes a Link as its trigger', () => {
    render(
      <HoverCard.Root>
        <HoverCard.Trigger render={<Link href="/ada" />}>@ada</HoverCard.Trigger>
        <HoverCard.Popup>Ada Lovelace</HoverCard.Popup>
      </HoverCard.Root>,
    );
    const link = screen.getByRole('link', { name: '@ada' });
    expect(link).toHaveClass('link');
    expect(link).toHaveAttribute('href', '/ada');
  });
});
