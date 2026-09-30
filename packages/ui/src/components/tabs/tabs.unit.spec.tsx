import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tabs } from './index';

// Selection, keyboard and ARIA are @arun-dev/headless's and are tested there. These check
// only what ui adds: the class names, merged with yours.
describe('Tabs (ui)', () => {
  it('adds a class to every part, keeping yours', () => {
    render(
      <Tabs.Root defaultValue="a" className="root" data-testid="root">
        <Tabs.List aria-label="Sections" className="list">
          <Tabs.Tab value="a" className="tab">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a" className="panel">
          Panel
        </Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('tabs', 'root');
    expect(screen.getByRole('tablist')).toHaveClass('tabs-list', 'list');
    expect(screen.getByRole('tab')).toHaveClass('tabs-tab', 'tab');
    expect(screen.getByRole('tabpanel')).toHaveClass('tabs-panel', 'panel');
  });

  it('puts the list at the start unless position is end', () => {
    const { rerender } = render(
      <Tabs.Root defaultValue="a" data-testid="root">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByTestId('root')).not.toHaveClass('tabs-position-end');

    rerender(
      <Tabs.Root defaultValue="a" position="end" data-testid="root">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('tabs', 'tabs-position-end');
  });

  it('keeps the list first in the DOM whatever the position', () => {
    render(
      <Tabs.Root defaultValue="a" position="end" orientation="vertical" data-testid="root">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByTestId('root').firstElementChild).toBe(screen.getByRole('tablist'));
  });

  it('does not pass position to the element', () => {
    render(
      <Tabs.Root defaultValue="a" position="end" data-testid="root">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByTestId('root')).not.toHaveAttribute('position');
  });
});
