import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Contract: the reset keeps links underlined. In running text the underline is what tells a
 * link apart; taking it away leaves colour alone, which fails WCAG 1.4.1 in every app that
 * loads the reset. Components that are links in another shape remove it themselves.
 */
const css = (path: string) => readFileSync(join(__dirname, path), 'utf8');

describe('link underlines', () => {
  it('are not removed by the reset', () => {
    const rule = /(^|[\s,}])a\s*\{([^}]*)\}/m.exec(css('css/reset.css'));
    expect(rule?.[2] ?? '').not.toMatch(/text-decoration\s*:\s*none/);
  });

  it('are removed by the components that are links in another shape', () => {
    for (const [file, selector] of [
      ['components/chip/chip.css', '.chip'],
      ['components/card/card.css', '.card'],
      ['components/menu/menu.css', '.menu-item'],
      ['components/breadcrumb/breadcrumb.css', '.breadcrumb-link'],
      ['components/pagination/pagination.css', '.pagination-item'],
      ['components/button/button.css', '.btn'],
    ] as const) {
      const source = css(file);
      const start = source.indexOf(`${selector} {`);
      expect(start, `${selector} in ${file}`).toBeGreaterThan(-1);
      const block = source.slice(start, source.indexOf('}', start));
      expect(block, `${selector} in ${file}`).toMatch(/text-decoration\s*:\s*none/);
    }
  });
});
