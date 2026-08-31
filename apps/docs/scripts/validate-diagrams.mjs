/**
 * Diagrams render in the browser, so a syntax error in a .mmd file would reach a
 * reader as an empty box rather than a failed build. Parse them here instead.
 *
 * mermaid needs a DOM to parse, hence jsdom — this never runs in the site itself.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

const results = [];
let failed = 0;
const files = readdirSync('src/diagrams').filter((f) => f.endsWith('.mmd'));

if (files.length === 0) {
  console.error('No diagrams found in src/diagrams — has the directory moved?');
  process.exit(1);
}

for (const file of files) {
  const src = readFileSync(`src/diagrams/${file}`, 'utf8');
  try {
    await mermaid.parse(src);
    results.push(`  ok    ${file}`);
  } catch (error) {
    failed += 1;
    results.push(`  FAIL  ${file}: ${String(error).split('\n')[0]}`);
  }
}
console.error(results.join('\n'));

if (failed > 0) {
  console.error(`\n${failed} diagram(s) failed to parse.`);
  process.exit(1);
}

console.error(`\n${files.length} diagrams parsed.`);
