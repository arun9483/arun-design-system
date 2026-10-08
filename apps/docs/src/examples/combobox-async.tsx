import { useEffect, useState } from 'react';
import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '24rem' };

type User = { id: number; name: string };

const people = [
  'Aarav Shah',
  'Amelia Brown',
  'Chen Wei',
  'Diego Alvarez',
  'Fatima Khan',
  'Hana Sato',
  'Isabella Rossi',
  'Kwame Mensah',
  'Lucas Martin',
  'Maya Patel',
  'Noah Fischer',
  'Olivia Smith',
  'Priya Nair',
  'Sofia García',
  'Yuki Tanaka',
  'Zara Ahmed',
].map((name, id) => ({ id, name }));

/** Stands in for a request to your API. */
function searchUsers(query: string, signal: AbortSignal): Promise<User[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(people.filter((p) => p.name.toLowerCase().includes(q)));
    }, 400);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function ComboboxAsync() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<User[]>([]);

  // Loading starts as the query changes, in the handler rather than an effect: an effect that
  // sets state renders twice.
  function search(text: string) {
    // The same text starts no new request, so it must not start loading either.
    if (text === query) return;
    setQuery(text);
    const empty = text.trim() === '';
    setLoading(!empty);
    if (empty) setResults([]);
  }

  // Debounce the query, cancel the request it replaces.
  useEffect(() => {
    if (query.trim() === '') return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchUsers(query, controller.signal)
        .then((users) => {
          setResults(users);
          setLoading(false);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const status = loading
    ? 'Searching…'
    : query.trim() === ''
      ? 'Start typing to search people.'
      : `${results.length} result${results.length === 1 ? '' : 's'}`;

  return (
    <div style={field}>
      <label htmlFor="combobox-reviewers">Reviewers</label>
      <Combobox.Root
        items={results}
        // The server already filtered: show its results as they are.
        filter={null}
        itemToString={userName}
        itemToKey={userId}
        multiple
        value={value}
        onValueChange={setValue}
        onInputValueChange={search}
        loading={loading}
      >
        <Combobox.Input
          id="combobox-reviewers"
          placeholder={value.length > 0 ? undefined : 'Search people…'}
        />
        <Combobox.Popup>
          <Combobox.Status>{status}</Combobox.Status>
          <Combobox.List>
            {(user: User) => (
              <Combobox.Item key={user.id} value={user}>
                {user.name}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}

function userName(user: User) {
  return user.name;
}

function userId(user: User) {
  return String(user.id);
}
