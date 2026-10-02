import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Breadcrumb } from './index';

describe('Breadcrumb', () => {
  it('is a labelled nav around an ordered list, with the current page marked', () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/docs/">Docs</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Button</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.Root>,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.firstElementChild?.tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs/');
    const current = screen.getByText('Button');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.closest('a')).toBeNull();
  });
});
