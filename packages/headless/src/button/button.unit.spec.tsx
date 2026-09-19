import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './index';

const el = () => screen.getByTestId('b');

describe('Button', () => {
  it('renders a native button with an explicit type', () => {
    render(<Button data-testid="b">go</Button>);
    expect(el().tagName).toBe('BUTTON');
    expect(el()).toHaveAttribute('type', 'button');
  });

  it('keeps a submit button a submit button', () => {
    render(
      <Button type="submit" data-testid="b">
        go
      </Button>,
    );
    expect(el()).toHaveAttribute('type', 'submit');
  });

  it('leans on the platform when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick} data-testid="b">
        go
      </Button>,
    );
    expect(el()).toBeDisabled();
    expect(el()).toHaveAttribute('data-disabled');
    fireEvent.click(el());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('leaves disabling to a render component, which it cannot inspect', () => {
    function Forwarding(props: Record<string, unknown>) {
      return <button {...props} />;
    }
    render(
      <Button render={<Forwarding />} disabled data-testid="b">
        go
      </Button>,
    );
    expect(el()).not.toBeDisabled();
    expect(el()).toHaveAttribute('aria-disabled', 'true');
    expect(el()).toHaveAttribute('data-disabled');
  });

  it('renders the element given to `render`, merging its own props onto it', () => {
    render(
      <Button render={<span />} className="btn" data-testid="b">
        go
      </Button>,
    );
    expect(el().tagName).toBe('SPAN');
    expect(el()).toHaveClass('btn');
  });

  it('gives the render element its children when it declares none', () => {
    render(
      <Button render={<span />} data-testid="b">
        Docs
      </Button>,
    );
    expect(el()).toHaveTextContent('Docs');
  });

  it("lets the render element's own children win", () => {
    render(
      <Button render={<span>Read the docs</span>} data-testid="b">
        Docs
      </Button>,
    );
    // `children` is a plain value and the render element is the last tier, so its own
    // content is the last word — the same rule that lets a bare element inherit yours.
    expect(el()).toHaveTextContent('Read the docs');
    expect(el()).not.toHaveTextContent('Docs');
  });

  it('takes the render element as the whole content when Button has no children', () => {
    render(<Button render={<span>Read the docs</span>} data-testid="b" />);
    // Nothing to merge from the component: `children: undefined` is skipped, so the
    // element's own content is all there is.
    expect(el().tagName).toBe('SPAN');
    expect(el()).toHaveTextContent('Read the docs');
    expect(el()).not.toHaveAttribute('data-disabled');
    expect(el()).not.toHaveAttribute('aria-disabled');
  });

  it('spreads unrecognised props onto the element', () => {
    render(
      <Button id="go" aria-describedby="hint" data-testid="b">
        go
      </Button>,
    );
    expect(el()).toHaveAttribute('id', 'go');
    expect(el()).toHaveAttribute('aria-describedby', 'hint');
  });
});
