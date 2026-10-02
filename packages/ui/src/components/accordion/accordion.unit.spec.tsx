import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { Accordion } from './index';

function Faq({ exclusive = false }: { exclusive?: boolean }) {
  return (
    <Accordion.Root exclusive={exclusive} data-testid="root">
      <Accordion.Item defaultOpen data-testid="one">
        <Accordion.Trigger>Shipping</Accordion.Trigger>
        <Accordion.Panel>Two to five days.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item data-testid="two">
        <Accordion.Trigger>Returns</Accordion.Trigger>
        <Accordion.Panel>Thirty days.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion', () => {
  it('is <details> and <summary>, with defaultOpen read at mount', () => {
    render(<Faq />);
    const one = screen.getByTestId('one');
    expect(one.tagName).toBe('DETAILS');
    expect(one).toHaveClass('accordion-item');
    expect(one).toHaveAttribute('open');
    expect(screen.getByTestId('two')).not.toHaveAttribute('open');
    expect(screen.getByText('Shipping').closest('summary')).toHaveClass('accordion-trigger');
    expect(screen.getByTestId('root')).toHaveClass('accordion');
  });

  it('gives every Item one name under an exclusive Root, and none otherwise', () => {
    const { unmount } = render(<Faq exclusive />);
    const name = screen.getByTestId('one').getAttribute('name');
    expect(name).toBeTruthy();
    expect(screen.getByTestId('two')).toHaveAttribute('name', name);
    unmount();
    render(<Faq />);
    expect(screen.getByTestId('one')).not.toHaveAttribute('name');
  });

  it('keeps what the browser did when the parent re-renders', () => {
    function Parent() {
      const [, setTick] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setTick((t) => t + 1)}>
            Re-render
          </button>
          <Accordion.Item defaultOpen data-testid="item">
            <Accordion.Trigger>Title</Accordion.Trigger>
            <Accordion.Panel>Body</Accordion.Panel>
          </Accordion.Item>
        </>
      );
    }
    render(<Parent />);
    const item = screen.getByTestId('item') as HTMLDetailsElement;
    item.open = false;
    screen.getByRole('button', { name: 'Re-render' }).click();
    expect(item.open).toBe(false);
  });
});
