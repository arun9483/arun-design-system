import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { ReactElement, ReactNode, Ref } from 'react';
import { useRender } from './useRender';
import { booleanAttribute } from './stateAttributes';

type FixtureState = { checked: boolean; disabled: boolean };

const stateAttributes = {
  checked: booleanAttribute('data-checked', 'data-unchecked'),
  disabled: booleanAttribute('data-disabled'),
};

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
  return useRender<FixtureState>({
    render: renderProp,
    defaultTagName: 'span',
    state: { checked, disabled },
    stateAttributes,
    props: [{ className: 'fixture' }, rest, { children }],
  });
}

describe('useRender', () => {
  it('renders the default element with the merged props', () => {
    render(<Fixture>content</Fixture>);
    const el = screen.getByText('content');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('fixture');
  });

  it('projects state onto the DOM as data-* attributes', () => {
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

  it('renders the element given to `render`, keeping the state attributes', () => {
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
