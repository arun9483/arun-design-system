/**
 * Primitives `@arun-dev/ui` is built from, published only because it is a separate
 * package and cannot reach into this one otherwise.
 *
 * **No stability guarantee.** Anything here may change shape or disappear in a minor
 * release. Build against the root entry point instead — `useRender`, `mergeProps`,
 * `useControlled` and the state-attribute helpers are the supported surface.
 *
 * See decision 9 in docs/architecture.md.
 */
export {
  useButton,
  retractActivationProps,
  type UseButtonParams,
  type UseButtonReturn,
} from './useButton';
