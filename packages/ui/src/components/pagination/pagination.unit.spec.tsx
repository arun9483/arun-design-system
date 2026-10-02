import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination, paginationRange } from './pagination';

describe('paginationRange', () => {
  it('shows every page when they fit', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationRange(1, 1)).toEqual([1]);
  });

  it('keeps the ends and the neighbours, in a constant number of slots', () => {
    expect(paginationRange(6, 10)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 10]);
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
    expect(paginationRange(10, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    for (let page = 1; page <= 20; page++) expect(paginationRange(page, 20)).toHaveLength(7);
  });

  it('never uses an ellipsis for a single page', () => {
    expect(paginationRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
    expect(paginationRange(7, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
  });

  it('widens with siblings', () => {
    expect(paginationRange(10, 20, 2)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20]);
  });
});

describe('Pagination', () => {
  it('renders buttons that call onPageChange, with the current page marked', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} count={5} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    screen.getByRole('button', { name: 'Next' }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
    screen.getByRole('button', { name: 'Page 3' }).click();
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('renders links with getHref, and plain text for an unavailable Next', () => {
    render(<Pagination page={5} count={5} getHref={(p) => `?page=${p}`} />);
    expect(screen.getByRole('link', { name: 'Page 4' })).toHaveAttribute('href', '?page=4');
    expect(screen.getByRole('link', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull();
    expect(screen.getByText('Next')).toHaveAttribute('data-disabled');
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '?page=4');
  });
});
