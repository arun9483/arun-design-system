import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactElement, ReactNode, Ref } from 'react';
import type React from 'react';
import { useRender } from './useRender';

/** A minimal part, standing in for a real component. */
function Fixture({
  checked = false,
  disabled = false,
  render: renderProp,
  children,
  ...rest
}: {
  checked?: boolean;
  disabled?: boolean;
  render?: ReactElement;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
} & Record<string, unknown>) {
  return useRender({
    render: renderProp,
    defaultTagName: 'span',
    props: {
      'data-checked': checked ? '' : undefined,
      'data-unchecked': checked ? undefined : '',
      'data-disabled': disabled ? '' : undefined,
      className: 'fixture',
      children,
    },
    consumerProps: rest,
  });
}

describe('useRender', () => {
  it('renders the default element with the merged props', () => {
    render(<Fixture>content</Fixture>);
    const el = screen.getByText('content');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('fixture');
  });

  it('puts the data-* attributes a component emits onto the element', () => {
    render(<Fixture checked>content</Fixture>);
    const el = screen.getByText('content');
    expect(el).toHaveAttribute('data-checked');
    expect(el).not.toHaveAttribute('data-unchecked');
    expect(el).not.toHaveAttribute('data-disabled');
  });

  it('emits the mutually exclusive attribute for the false case', () => {
    render(
      <Fixture checked={false} disabled>
        content
      </Fixture>,
    );
    const el = screen.getByText('content');
    expect(el).toHaveAttribute('data-unchecked');
    expect(el).toHaveAttribute('data-disabled');
  });

  it('renders the element given to `render`, keeping the data-* attributes', () => {
    render(
      <ul>
        <Fixture checked render={<li />}>
          content
        </Fixture>
      </ul>,
    );
    const el = screen.getByText('content');
    expect(el.tagName).toBe('LI');
    expect(el).toHaveClass('fixture');
    expect(el).toHaveAttribute('data-checked');
  });

  it('lets the render element keep its own attributes', () => {
    render(<Fixture render={<button type="submit" />}>content</Fixture>);
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('type', 'submit');
    expect(el).toHaveClass('fixture');
  });

  it("takes the render element's children when it has its own", () => {
    render(
      <ul>
        <Fixture render={<li data-testid="el">from the element</li>}>from the component</Fixture>
      </ul>,
    );
    // `children` is a plain value, so the last object to declare it wins — and the
    // render element's props are the last tier.
    expect(screen.getByTestId('el')).toHaveTextContent('from the element');
  });

  it("keeps the component's children when the render element declares none", () => {
    render(
      <ul>
        <Fixture render={<li data-testid="el" />}>from the component</Fixture>
      </ul>,
    );
    // An absent key is `undefined`, which mergeProps skips, so nothing is clobbered.
    expect(screen.getByTestId('el')).toHaveTextContent('from the component');
  });

  it('spreads unrecognised props onto the element', () => {
    render(
      <Fixture id="x" aria-label="labelled" data-testid="fixture">
        content
      </Fixture>,
    );
    const el = screen.getByTestId('fixture');
    expect(el).toHaveAttribute('id', 'x');
    expect(el).toHaveAttribute('aria-label', 'labelled');
  });

  it('gives the node to both the component ref and the render element ref', () => {
    const objectRef: { current: HTMLElement | null } = { current: null };
    const seen: (Element | null)[] = [];
    render(
      <Fixture ref={objectRef} render={<span ref={(node) => void seen.push(node)} />}>
        content
      </Fixture>,
    );
    expect(objectRef.current).toBe(screen.getByText('content'));
    expect(seen[0]).toBe(screen.getByText('content'));
  });

  it('clears an object ref and a legacy callback ref on unmount', () => {
    const objectRef: { current: HTMLElement | null } = { current: null };
    const seen: (Element | null)[] = [];
    const { unmount } = render(
      <Fixture ref={objectRef} render={<span ref={(node) => void seen.push(node)} />}>
        content
      </Fixture>,
    );
    unmount();
    expect(objectRef.current).toBeNull();
    // A legacy callback ref returns nothing, so it must still be called with null.
    expect(seen.at(-1)).toBeNull();
  });
});

describe('precedence is fixed by useRender, not the caller', () => {
  /**
   * The three tiers a component cannot reorder: its own props (its `data-*` state
   * among them), the consumer's, and the render element's. Handlers run the other way,
   * so a consumer's runs before the component's and can stop it.
   */
  function Part({
    componentOnClick,
    consumer,
    render: renderProp,
  }: {
    componentOnClick: () => void;
    consumer?: Record<string, unknown>;
    render?: React.ReactElement;
  }) {
    return useRender({
      render: renderProp,
      defaultTagName: 'button',
      props: { className: 'component', onClick: componentOnClick },
      consumerProps: consumer,
    });
  }

  it("runs the consumer's handler before the component's", () => {
    const order: string[] = [];
    render(
      <Part
        componentOnClick={() => order.push('component')}
        consumer={{ onClick: () => order.push('consumer'), 'data-testid': 'el' }}
      />,
    );
    fireEvent.click(screen.getByTestId('el'));
    expect(order).toEqual(['consumer', 'component']);
  });

  it("lets the consumer stop the component's handler", () => {
    const component = vi.fn();
    render(
      <Part
        componentOnClick={component}
        consumer={{
          onClick: (event: { preventComponentHandler(): void }) => event.preventComponentHandler(),
          'data-testid': 'el',
        }}
      />,
    );
    fireEvent.click(screen.getByTestId('el'));
    expect(component).not.toHaveBeenCalled();
  });

  it("runs the render element's handler before the consumer's", () => {
    const order: string[] = [];
    render(
      <Part
        componentOnClick={() => order.push('component')}
        consumer={{ onClick: () => order.push('consumer'), 'data-testid': 'el' }}
        render={<button type="button" onClick={() => order.push('render')} />}
      />,
    );
    fireEvent.click(screen.getByTestId('el'));
    expect(order).toEqual(['render', 'consumer', 'component']);
  });

  it("lets a consumer's value override the component's", () => {
    render(
      <Part
        componentOnClick={() => {}}
        consumer={{ className: 'mine', 'data-testid': 'el', id: 'from-consumer' }}
      />,
    );
    // className concatenates rather than replacing; other values take the consumer's.
    expect(screen.getByTestId('el')).toHaveClass('component', 'mine');
    expect(screen.getByTestId('el')).toHaveAttribute('id', 'from-consumer');
  });
});
