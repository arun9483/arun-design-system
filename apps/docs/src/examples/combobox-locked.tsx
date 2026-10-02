import { useEffect, useState } from 'react';
import { Combobox } from '@arun-dev/ui';

const stack = { display: 'grid', gap: 'var(--space-s)', maxInlineSize: '24rem' };
const field = { display: 'grid', gap: 'var(--space-3xs)' };

// `required`: a code owner, who must review and can't be taken off.
type User = { id: number; name: string; required?: boolean };

const people: User[] = [
  'Aarav Shah',
  'Amelia Brown',
  'Chen Wei',
  'Diego Alvarez',
  'Fatima Khan',
  'Hana Sato',
  'Maya Patel',
  'Noah Fischer',
  'Priya Nair',
  'Yuki Tanaka',
].map((name, id) => ({ id, name, required: name === 'Priya Nair' || name === 'Chen Wei' }));

const byName = (name: string) => people.find((p) => p.name === name) as User;

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

// The saved assignment, as the server sent it: the code owners plus one more reviewer.
const saved = [byName('Priya Nair'), byName('Chen Wei'), byName('Maya Patel')];

export default function ComboboxLocked() {
  const [query, setQuery] = useState('');
  // Empty until someone searches: the locked chips never come back in a result list.
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewers, setReviewers] = useState<User[]>(saved);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
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

  return (
    <div style={stack}>
      <div style={field}>
        <label htmlFor="combobox-locked-reviewers">Reviewers</label>
        <Combobox.Root
          items={results}
          filter={null}
          itemToString={userName}
          itemToKey={userId}
          multiple
          value={reviewers}
          onValueChange={setReviewers}
          onInputValueChange={(text) => setQuery(text)}
          loading={loading}
          name="reviewers"
        >
          <Combobox.Input id="combobox-locked-reviewers" placeholder="Add reviewers…" />
          <Combobox.Popup>
            <Combobox.Status>{loading ? 'Searching…' : ''}</Combobox.Status>
            <Combobox.List>
              {(user: User) => (
                // Locked: once selected, its chip can't be removed.
                <Combobox.Item key={user.id} value={user} isLocked={user.required}>
                  {user.name}
                  {user.required && ' (code owner)'}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
        <small>Selected: {reviewers.map((u) => u.name).join(', ')}</small>
      </div>

      <div style={field}>
        <label htmlFor="combobox-locked-owner">Owner</label>
        {/* Single select has no locked item: disable the whole field to fix its value. */}
        <Combobox.Root
          items={people}
          itemToString={userName}
          itemToKey={userId}
          defaultValue={byName('Priya Nair')}
          disabled
          name="owner"
        >
          <Combobox.Input id="combobox-locked-owner" />
          <Combobox.Popup>
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
    </div>
  );
}

function userName(user: User) {
  return user.name;
}

function userId(user: User) {
  return String(user.id);
}
