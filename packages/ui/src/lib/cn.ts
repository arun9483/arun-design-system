/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately tiny: the design system's own classes are static, and a consumer's
 * className is merged by @arun-dev/headless rather than here.
 */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}
