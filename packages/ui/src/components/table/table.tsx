import type React from 'react';
import { cn } from '../../lib/cn';

type Part<Attrs, El> = Omit<Attrs, 'className'> & { className?: string; ref?: React.Ref<El> };

export type TableRootProps = Part<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement> & {
  /** Classes for the scrolling container around the table. */
  containerClassName?: string;
};
export type TableSectionProps = Part<
  React.HTMLAttributes<HTMLTableSectionElement>,
  HTMLTableSectionElement
>;
export type TableRowProps = Part<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
export type TableHeadProps = Part<
  React.ThHTMLAttributes<HTMLTableCellElement>,
  HTMLTableCellElement
>;
export type TableCellProps = Part<
  React.TdHTMLAttributes<HTMLTableCellElement>,
  HTMLTableCellElement
>;
export type TableCaptionProps = Part<
  React.HTMLAttributes<HTMLTableCaptionElement>,
  HTMLTableCaptionElement
>;

/**
 * A native `<table>`, styled (decision 17), in a container that scrolls sideways when the table
 * is wider than the page. Rows, headers and `scope` are the platform's.
 */
export function TableRoot({ className, containerClassName, ...rest }: TableRootProps) {
  return (
    <div className={cn('table-container', containerClassName)}>
      <table {...rest} className={cn('table', className)} />
    </div>
  );
}

/** What the table is: the first thing read. Visually hidden is fine, absent is not. */
export function TableCaption({ className, ...rest }: TableCaptionProps) {
  return <caption {...rest} className={cn('table-caption', className)} />;
}

export function TableHeader({ className, ...rest }: TableSectionProps) {
  return <thead {...rest} className={cn('table-header', className)} />;
}

export function TableBody({ className, ...rest }: TableSectionProps) {
  return <tbody {...rest} className={cn('table-body', className)} />;
}

export function TableFooter({ className, ...rest }: TableSectionProps) {
  return <tfoot {...rest} className={cn('table-footer', className)} />;
}

export function TableRow({ className, ...rest }: TableRowProps) {
  return <tr {...rest} className={cn('table-row', className)} />;
}

/**
 * A header cell: `<th scope="col">` unless you say `scope="row"`. For a sortable column, put a
 * `<button>` inside and `aria-sort` on this cell; the styling shows the direction.
 */
export function TableHead({ className, scope = 'col', ...rest }: TableHeadProps) {
  return <th scope={scope} {...rest} className={cn('table-head', className)} />;
}

export function TableCell({ className, ...rest }: TableCellProps) {
  return <td {...rest} className={cn('table-cell', className)} />;
}
