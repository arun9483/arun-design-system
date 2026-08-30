/**
 * @arun-dev/headless — unstyled React behaviour primitives.
 *
 * Ships no CSS, no class names and no colour. Components expose their state as
 * `data-*` attributes so a styling layer can react to it, and take a `render` prop so
 * the consumer keeps control of the element and its semantics.
 *
 * The engine is exported from the root; components will be added under their own
 * subpaths (`@arun-dev/headless/switch`) as they are built.
 */
export * from './core';
export { useButton, retractActivationProps, type UseButtonParams } from './useButton';
