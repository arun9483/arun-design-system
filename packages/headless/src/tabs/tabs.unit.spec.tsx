import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from './index';
import type { TabsRootProps } from './TabsRoot';

function Basic(props: TabsRootProps) {
  return (
    <Tabs.Root defaultValue="account" {...props}>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Tab value="team" disabled>
          Team
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account">Account panel</Tabs.Panel>
      <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      <Tabs.Panel value="team">Team panel</Tabs.Panel>
    </Tabs.Root>
  );
}

describe('Tabs', () => {
  it('renders the ARIA tabs pattern, wired by id', () => {
    render(<Basic />);
    const list = screen.getByRole('tablist', { name: 'Settings' });
    expect(list).not.toHaveAttribute('aria-orientation');
    const account = screen.getByRole('tab', { name: 'Account' });
    expect(account.tagName).toBe('BUTTON');
    expect(account).toHaveAttribute('type', 'button');
    expect(account).toHaveAttribute('aria-selected', 'true');

    const panel = screen.getByRole('tabpanel', { name: 'Account' });
    expect(account).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', account.id);
    expect(panel).toHaveAttribute('tabindex', '0');
    expect(panel).toHaveTextContent('Account panel');
  });

  it('shows only the selected panel, keeping the others mounted and hidden', () => {
    render(<Basic />);
    expect(screen.getByText('Account panel')).toBeVisible();
    const billing = screen.getByText('Billing panel');
    expect(billing).toHaveAttribute('hidden');
    expect(billing).toHaveAttribute('data-unselected');
  });

  it('gives the Tab stop to the selected tab only', () => {
    render(<Basic />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '-1');
  });

  it('falls back to the first enabled tab when the selected one is disabled or missing', () => {
    const { unmount } = render(<Basic defaultValue="team" />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    unmount();
    render(<Basic defaultValue="nope" />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
  });

  it('selects on click, reports it, and moves the Tab stop', () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    const billing = screen.getByRole('tab', { name: 'Billing' });
    fireEvent.click(billing);
    expect(onValueChange).toHaveBeenCalledWith('billing');
    expect(billing).toHaveAttribute('aria-selected', 'true');
    expect(billing).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Billing panel')).not.toHaveAttribute('hidden');
  });

  it('does not select a disabled tab', () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    const team = screen.getByRole('tab', { name: 'Team' });
    expect(team).toBeDisabled();
    fireEvent.click(team);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('with focusableWhenDisabled and manual activation, marks it aria-disabled', () => {
    const onValueChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Tabs.Root
        defaultValue="a"
        activationMode="manual"
        focusableWhenDisabled
        onValueChange={onValueChange}
      >
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b" disabled onClick={onClick}>
            B
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>,
    );
    const b = screen.getByRole('tab', { name: 'B' });
    expect(b).not.toBeDisabled();
    expect(b).toHaveAttribute('aria-disabled', 'true');
    expect(b).toHaveAttribute('data-disabled');
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ignores focusableWhenDisabled under automatic activation', () => {
    render(<Basic focusableWhenDisabled />);
    const team = screen.getByRole('tab', { name: 'Team' });
    expect(team).toBeDisabled();
    expect(team).not.toHaveAttribute('aria-disabled');
  });

  it('is controlled by value', () => {
    const onValueChange = vi.fn();
    render(<Basic value="account" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(onValueChange).toHaveBeenCalledWith('billing');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
  });

  it('states a vertical orientation', () => {
    render(<Basic orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByRole('tablist')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('makes ids safe for values with spaces', () => {
    render(
      <Tabs.Root defaultValue="a b">
        <Tabs.List>
          <Tabs.Tab value="a b">A B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a b">Panel</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tab').getAttribute('aria-controls')).not.toMatch(/\s/);
    expect(screen.getByRole('tabpanel', { name: 'A B' })).toBeInTheDocument();
  });

  it.each(['List', 'Tab', 'Panel'] as const)('throws when Tabs.%s is outside Tabs.Root', (part) => {
    const Part = Tabs[part] as (props: { value: string }) => React.ReactNode;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Part value="x" />)).toThrow(
      `<Tabs.${part}> must be rendered inside <Tabs.Root>.`,
    );
  });
});
