import { useEffect, useState } from 'react';
import { Badge, Button, Card, Chip } from '@arun-dev/ui';
import type { BadgeTone } from '@arun-dev/ui';
import { BRAND_NAMES, BRANDS, applyBrand, type BrandName } from './brands';
import { Section } from './Section';

type Theme = 'system' | 'light' | 'dark';

const THEMES: Theme[] = ['system', 'light', 'dark'];
const TONES: BadgeTone[] = ['neutral', 'success', 'warning', 'error', 'info'];

export function App() {
  const [theme, setTheme] = useState<Theme>('system');
  const [brand, setBrand] = useState<BrandName>('default');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    applyBrand(brand);
  }, [brand]);

  return (
    <>
      <header className="demo-bar">
        <div className="demo-bar-inner">
          <div>
            <p className="type-overline">arun-design-system</p>
            <p className="text-size-xs text-color-muted">
              Every component, every variant. Switch theme and brand — no component re-renders
              differently, only the tokens beneath them change.
            </p>
          </div>

          <div className="demo-controls">
            <fieldset className="demo-group">
              <legend className="text-size-xs text-color-muted">Theme</legend>
              {THEMES.map((t) => (
                <Chip
                  key={t}
                  render={<button type="button" />}
                  variant={theme === t ? 'accent' : 'default'}
                  aria-pressed={theme === t}
                  onClick={() => setTheme(t)}
                >
                  {t}
                </Chip>
              ))}
            </fieldset>

            <fieldset className="demo-group">
              <legend className="text-size-xs text-color-muted">Brand</legend>
              {BRAND_NAMES.map((b) => (
                <Chip
                  key={b}
                  render={<button type="button" />}
                  variant={brand === b ? 'accent' : 'default'}
                  aria-pressed={brand === b}
                  onClick={() => setBrand(b)}
                >
                  <span className="demo-swatch" style={{ background: BRANDS[b].seed }} />
                  {b}
                </Chip>
              ))}
            </fieldset>
          </div>
        </div>
      </header>

      <main className="demo-page stack space-xl">
        <Section
          title="Button"
          note="A bare Button renders <button type='button'>. Give it href for an anchor, or render for anything else."
        >
          <div className="demo-row">
            <Button>Ghost</Button>
            <Button variant="primary">Primary</Button>
            <Button disabled>Disabled</Button>
            <Button href="https://example.com" target="_blank" rel="noopener noreferrer">
              Anchor via href
            </Button>
            <Button variant="primary" render={<a href="#button" />}>
              Anchor via render
            </Button>
          </div>
        </Section>

        <Section
          title="Card"
          note="Defaults to a div. `as` takes a tag name, `render` takes an element."
        >
          <div className="demo-grid">
            <Card className="demo-card">
              <p className="font-weight-semibold">Default</p>
              <p className="text-size-sm text-color-secondary">Static container.</p>
            </Card>
            <Card lift className="demo-card">
              <p className="font-weight-semibold">lift</p>
              <p className="text-size-sm text-color-secondary">Raises on hover.</p>
            </Card>
            <Card as="article" className="demo-card">
              <p className="font-weight-semibold">as=&quot;article&quot;</p>
              <p className="text-size-sm text-color-secondary">Semantic element, same styling.</p>
            </Card>
            <Card render={<section aria-label="Rendered section" />} className="demo-card">
              <p className="font-weight-semibold">render</p>
              <p className="text-size-sm text-color-secondary">
                Unrecognised props reach the DOM — this one carries an aria-label.
              </p>
            </Card>
          </div>
        </Section>

        <Section title="Chip" note="Renders a span. Use render to keep list or button semantics.">
          <div className="demo-row">
            <Chip>default</Chip>
            <Chip variant="accent">accent</Chip>
            <Chip render={<button type="button" />}>as a button</Chip>
            <Chip render={<a href="#chip" />}>as a link</Chip>
          </div>
          <ul className="demo-row demo-reset-list">
            <Chip render={<li />}>li</Chip>
            <Chip render={<li />} variant="accent">
              inside a real ul
            </Chip>
          </ul>
        </Section>

        <Section
          title="Badge"
          note="Generic tones only. Domain vocabulary maps onto a tone at the call site."
        >
          <div className="demo-row">
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
        </Section>

        <Section
          title="CSS-only classes"
          note="Shipped by @arun-dev/ui/components.css for elements the components do not render."
        >
          <div className="demo-row">
            <dl className="metric demo-metric">
              <dt className="text-size-xs font-weight-medium text-color-accent">Uptime</dt>
              <dd className="text-size-sm font-weight-bold">99.98%</dd>
            </dl>
            <dl className="metric demo-metric">
              <dt className="text-size-xs font-weight-medium text-color-accent">p95</dt>
              <dd className="text-size-sm font-weight-bold">184ms</dd>
            </dl>
          </div>
          <p className="text-size-3xl type-display">type-display</p>
          <p className="type-overline">type-overline</p>
          <p className="text-size-sm text-color-muted truncate demo-truncate">
            truncate — this sentence is deliberately long so that it is clipped with an ellipsis
            rather than wrapping onto a second line.
          </p>
        </Section>

        <Section title="Semantic tokens" note="Every colour above resolves through these.">
          <div className="demo-row">
            {[
              '--color-bg-surface',
              '--color-bg-accent',
              '--color-text-accent',
              '--color-border-accent',
              '--color-status-success',
              '--color-status-warning',
              '--color-status-error',
              '--color-status-info',
            ].map((token) => (
              <span key={token} className="demo-token">
                <span className="demo-swatch" style={{ background: `var(${token})` }} />
                <code className="text-size-xs">{token}</code>
              </span>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
