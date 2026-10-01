import { useCallback, useState } from 'react';
import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

const PAGE = 20;
const TOTAL = 200;
const allIssues = Array.from({ length: TOTAL }, (_, i) => `Issue #${i + 1}`);

/** Stands in for a paged API: the next 20 after `offset`. */
function fetchPage(offset: number): Promise<string[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(allIssues.slice(offset, offset + PAGE)), 300),
  );
}

export default function ComboboxLazy() {
  const [items, setItems] = useState(() => allIssues.slice(0, PAGE));
  const [loading, setLoading] = useState(false);

  // Called when the end of the list scrolls into view, and never while `loading`.
  const loadMore = useCallback(() => {
    if (items.length >= TOTAL) return;
    setLoading(true);
    fetchPage(items.length).then((page) => {
      setItems((current) => [...current, ...page]);
      setLoading(false);
    });
  }, [items.length]);

  return (
    <div style={field}>
      <label htmlFor="combobox-issue">Issue</label>
      <Combobox.Root items={items} onLoadMore={loadMore} loading={loading}>
        <Combobox.Input id="combobox-issue" placeholder="Scroll the list to load more" />
        <Combobox.Popup>
          <Combobox.List>
            {(issue: string) => (
              <Combobox.Item key={issue} value={issue}>
                {issue}
              </Combobox.Item>
            )}
          </Combobox.List>
          <Combobox.Status>
            {loading ? 'Loading more…' : `${items.length} of ${TOTAL}`}
          </Combobox.Status>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
