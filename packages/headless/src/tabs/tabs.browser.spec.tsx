import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from './index';
import type { TabsRootProps } from './TabsRoot';

/** Runs in Chromium: real focus, real Tab order and real key handling. */

function Basic(props: TabsRootProps) {
  return (
    <>
      <button type="button">Before</button>
      <Tabs.Root defaultValue="account" {...props}>
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="account">Account</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
          <Tabs.Tab value="team" disabled>
            Team
          </Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="account">Account panel</Tabs.Panel>
        <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
        <Tabs.Panel value="team">Team panel</Tabs.Panel>
        <Tabs.Panel value="security">
          <a href="#x">Security link</a>
        </Tabs.Panel>
      </Tabs.Root>
      <button type="button">After</button>
    </>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });
const focused = () => document.activeElement;

describe('Tabs (browser)', () => {
  it('is one Tab stop: Tab enters at the selected tab, then goes to the panel', async () => {
    render(<Basic defaultValue="billing" />);
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe(tab('Billing'));
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe(screen.getByRole('tabpanel', { name: 'Billing' }));
  });

  it('moves with the arrows, skipping disabled tabs and wrapping', async () => {
    render(<Basic activationMode="manual" />);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Billing'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Security'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Account'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(tab('Security'));
  });

  it('goes to the ends with Home and End', async () => {
    render(<Basic activationMode="manual" />);
    tab('Billing').focus();
    await userEvent.keyboard('{End}');
    expect(focused()).toBe(tab('Security'));
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe(tab('Account'));
  });

  it('selects on focus when automatic', async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Billing panel')).toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith('billing');
  });

  it('only moves focus when manual, and selects on Enter or Space', async () => {
    const onValueChange = vi.fn();
    render(<Basic activationMode="manual" onValueChange={onValueChange} />);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Billing'));
    expect(tab('Account')).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{Enter}');
    expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}{ }');
    expect(tab('Security')).toHaveAttribute('aria-selected', 'true');
  });

  it('uses Up and Down when vertical', async () => {
    render(<Basic orientation="vertical" activationMode="manual" />);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Account'));
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(tab('Billing'));
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(focused()).toBe(tab('Security'));
  });

  it('swaps Left and Right in a right-to-left layout', async () => {
    render(
      <div dir="rtl">
        <Basic activationMode="manual" />
      </div>,
    );
    tab('Account').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(tab('Billing'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Account'));
  });

  it('leaves a nested tablist its own keys', async () => {
    render(
      <Tabs.Root defaultValue="outer-a">
        <Tabs.List aria-label="Outer">
          <Tabs.Tab value="outer-a">Outer A</Tabs.Tab>
          <Tabs.Tab value="outer-b">Outer B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="outer-a">
          <Tabs.Root defaultValue="inner-a" activationMode="manual">
            <Tabs.List aria-label="Inner">
              <Tabs.Tab value="inner-a">Inner A</Tabs.Tab>
              <Tabs.Tab value="inner-b">Inner B</Tabs.Tab>
            </Tabs.List>
          </Tabs.Root>
        </Tabs.Panel>
      </Tabs.Root>,
    );
    tab('Inner A').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('Inner B'));
    expect(tab('Outer A')).toHaveAttribute('aria-selected', 'true');
  });

  it('follows a tab inserted later, in document order', async () => {
    function Growing({ withB }: { withB: boolean }) {
      return (
        <Tabs.Root defaultValue="a" activationMode="manual">
          <Tabs.List aria-label="Growing">
            <Tabs.Tab value="a">A</Tabs.Tab>
            {withB && <Tabs.Tab value="b">B</Tabs.Tab>}
            <Tabs.Tab value="c">C</Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
      );
    }
    // Same instance throughout: B registers after A and C, but is ordered between them.
    const { rerender } = render(<Growing withB={false} />);
    rerender(<Growing withB />);
    tab('A').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('B'));

    rerender(<Growing withB={false} />);
    tab('A').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(tab('C'));
  });
});
