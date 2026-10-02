import type React from 'react';
import { cn } from '../../lib/cn';

/** A page number, or a gap between the numbers shown. */
export type PaginationEntry = number | 'ellipsis';

/**
 * The pages to show, in a constant number of slots so the row does not jump: every page when
 * they fit in `2 × siblings + 5`; otherwise the first, the last, the current one with `siblings`
 * either side, and an ellipsis wherever it stands for two pages or more. A pure function, for a
 * layout of your own.
 *
 * @example paginationRange(6, 10) // [1, 'ellipsis', 5, 6, 7, 'ellipsis', 10]
 */
export function paginationRange(page: number, count: number, siblings = 1): PaginationEntry[] {
  const pages = (from: number, to: number) =>
    Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  if (count <= 2 * siblings + 5) return pages(1, count);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, count);
  // At an end, the slots an ellipsis would take go to pages instead.
  const edge = 3 + 2 * siblings;
  const leftGap = left > 3;
  const rightGap = right < count - 2;

  if (!leftGap) return [...pages(1, edge), 'ellipsis', count];
  if (!rightGap) return [1, 'ellipsis', ...pages(count - edge + 1, count)];
  return [1, 'ellipsis', ...pages(left, right), 'ellipsis', count];
}

type PaginationOwnProps = {
  /** The current page, from 1. */
  page: number;
  /** How many pages there are. */
  count: number;
  /** Pages shown either side of the current one. */
  siblings?: number;
  /** Each page's address: pages become links. The right choice when pages are URLs. */
  getHref?: (page: number) => string;
  /** Called with the page to go to. Without `getHref`, pages are buttons that call it. */
  onPageChange?: (page: number) => void;
  /** Text of the Previous and Next controls, and each page's accessible name. */
  labels?: { previous?: string; next?: string; page?: (page: number) => string };
  className?: string;
  ref?: React.Ref<HTMLElement>;
};

export type PaginationProps = PaginationOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof PaginationOwnProps | 'children'>;

/**
 * Page links, or buttons, in a `<nav aria-label="Pagination">` (decision 17). The page is
 * yours — usually the URL's — so `page` and `count` are required. The current page is
 * `aria-current="page"`.
 */
export function Pagination({
  page,
  count,
  siblings = 1,
  getHref,
  onPageChange,
  labels,
  className,
  ...rest
}: PaginationProps) {
  const previousLabel = labels?.previous ?? 'Previous';
  const nextLabel = labels?.next ?? 'Next';
  const pageLabel = labels?.page ?? ((p: number) => `Page ${p}`);

  function control(target: number, content: React.ReactNode, extra: Record<string, unknown>) {
    const available = target >= 1 && target <= count && target !== page;
    const isCurrent = target === page && typeof content === 'number';
    if (getHref) {
      // A link cannot be disabled: an unavailable Previous or Next is plain text.
      if (!available && !isCurrent) {
        return (
          <span className="pagination-item" data-disabled="">
            {content}
          </span>
        );
      }
      return (
        <a
          className="pagination-item"
          href={getHref(target)}
          aria-current={isCurrent ? 'page' : undefined}
          onClick={onPageChange ? () => onPageChange(target) : undefined}
          {...extra}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        type="button"
        className="pagination-item"
        aria-current={isCurrent ? 'page' : undefined}
        disabled={!available && !isCurrent}
        onClick={() => onPageChange?.(target)}
        {...extra}
      >
        {content}
      </button>
    );
  }

  return (
    <nav aria-label="Pagination" {...rest} className={cn('pagination', className)}>
      <ul className="pagination-list">
        <li>{control(page - 1, previousLabel, { 'data-direction': 'previous' })}</li>
        {paginationRange(page, count, siblings).map((entry, index) => (
          <li key={entry === 'ellipsis' ? `ellipsis-${index}` : entry}>
            {entry === 'ellipsis' ? (
              <span className="pagination-ellipsis">…</span>
            ) : (
              control(entry, entry, { 'aria-label': pageLabel(entry) })
            )}
          </li>
        ))}
        <li>{control(page + 1, nextLabel, { 'data-direction': 'next' })}</li>
      </ul>
    </nav>
  );
}
