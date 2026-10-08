import mermaid from 'mermaid';
import { describe, expect, it } from 'vitest';

/**
 * Diagrams render in the browser, so a syntax error in a .mmd file would reach a reader as
 * an empty box rather than a failed build. Parse them here instead, found the way
 * Diagram.astro finds them.
 */
const diagrams = import.meta.glob<string>('./*.mmd', {
  query: '?raw',
  import: 'default',
  eager: true,
});

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

describe('diagrams', () => {
  it('finds the diagrams', () => {
    // A moved directory would otherwise leave nothing to check, and pass.
    expect(Object.keys(diagrams).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(diagrams))('%s parses', async (_, source) => {
    await expect(mermaid.parse(source)).resolves.toBeTruthy();
  });
});
