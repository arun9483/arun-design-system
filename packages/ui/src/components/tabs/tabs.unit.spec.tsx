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
});
