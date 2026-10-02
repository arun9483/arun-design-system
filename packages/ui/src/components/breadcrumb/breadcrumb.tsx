import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type PartProps<Attrs> = {
  className?: string;
  /** Element to render instead of the default. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
} & Omit<Attrs, 'className'>;

export type BreadcrumbRootProps = PartProps<React.HTMLAttributes<HTMLElement>>;
export type BreadcrumbItemProps = PartProps<React.LiHTMLAttributes<HTMLLIElement>>;
export type BreadcrumbLinkProps = PartProps<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
export type BreadcrumbCurrentProps = PartProps<React.HTMLAttributes<HTMLElement>>;

/**
 * Where the page sits (decision 17): a `<nav aria-label="Breadcrumb">` around an ordered list.
 * Separators are drawn by CSS and not read out. Rename it with `aria-label` if a page has two.
 */
export function BreadcrumbRoot({ className, children, render, ...rest }: BreadcrumbRootProps) {
  return useRender({
    render,
    defaultTagName: 'nav',
    props: {
      'aria-label': 'Breadcrumb',
      className: cn('breadcrumb', className),
      children: <ol className="breadcrumb-list">{children}</ol>,
    },
    consumerProps: rest,
  });
}

/** One step of the trail. */
export function BreadcrumbItem({ className, render, ...rest }: BreadcrumbItemProps) {
  return useRender({
    render,
    defaultTagName: 'li',
    props: { className: cn('breadcrumb-item', className) },
    consumerProps: rest,
  });
}

/** A step you can go back to: an `<a>`, or your router's link through `render`. */
export function BreadcrumbLink({ className, render, ...rest }: BreadcrumbLinkProps) {
  return useRender({
    render,
    defaultTagName: 'a',
    props: { className: cn('breadcrumb-link', className) },
    consumerProps: rest,
  });
}

/** The page you are on: not a link, and `aria-current="page"`. */
export function BreadcrumbCurrent({ className, render, ...rest }: BreadcrumbCurrentProps) {
  return useRender({
    render,
    defaultTagName: 'span',
    props: { 'aria-current': 'page', className: cn('breadcrumb-current', className) },
    consumerProps: rest,
  });
}
