import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Stepper } from './index';

function Checkout(props: { labels?: { complete?: string } }) {
  return (
    <Stepper.Root aria-label="Checkout progress" {...props}>
      <Stepper.Item status="complete">Cart</Stepper.Item>
      <Stepper.Item status="current">Shipping</Stepper.Item>
      <Stepper.Item>Payment</Stepper.Item>
    </Stepper.Root>
  );
}

describe('Stepper', () => {
  it('is a named ordered list of steps', () => {
    render(<Checkout />);
    const list = screen.getByRole('list', { name: 'Checkout progress' });
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('stepper');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks the current step for assistive technology and for styling', () => {
    render(<Checkout />);
    const [cart, shipping, payment] = screen.getAllByRole('listitem');
    expect(shipping).toHaveAttribute('aria-current', 'step');
    expect(shipping).toHaveClass('stepper-item', 'stepper-item-current');
    expect(cart).not.toHaveAttribute('aria-current');
    expect(cart).toHaveClass('stepper-item-complete');
    expect(payment).toHaveClass('stepper-item-upcoming');
  });

  it('says a step is complete in words, not only with the tick', () => {
    render(<Checkout />);
    const [cart, shipping] = screen.getAllByRole('listitem');
    expect(cart).toHaveTextContent('Cart (completed)');
    expect(screen.getByText('(completed)', { exact: false })).toHaveClass('sr-only');
    expect(shipping).toHaveTextContent(/^Shipping$/);
  });

  it('hides the drawn indicator from screen readers', () => {
    render(<Checkout />);
    for (const item of screen.getAllByRole('listitem')) {
      expect(item.querySelector('.stepper-indicator')).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('takes a translated completed label', () => {
    render(<Checkout labels={{ complete: 'terminé' }} />);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Cart (terminé)');
  });

  it('lays out down a column when vertical', () => {
    render(
      <Stepper.Root aria-label="Setup" orientation="vertical">
        <Stepper.Item status="current">Account</Stepper.Item>
      </Stepper.Root>,
    );
    expect(screen.getByRole('list')).toHaveClass('stepper', 'stepper-vertical');
  });

  it('holds a button to go back to a step', () => {
    render(
      <Stepper.Root aria-label="Checkout progress">
        <Stepper.Item status="complete">
          <button type="button">Cart</button>
        </Stepper.Item>
      </Stepper.Root>,
    );
    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument();
  });
});
