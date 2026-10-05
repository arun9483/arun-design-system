import { useRef, useState, type CSSProperties } from 'react';
import { Calendar, Stack, Text, type CalendarProps } from '@arun-dev/ui';

/** One day as the hall's API returns it. */
type HallDay = {
  festival?: string;
  holiday?: string;
  birthdays?: string[];
  booking?: string;
};

/** A stand-in for the API: what is on in the hall, for any range of dates. */
const EVENTS: Record<string, HallDay> = {
  '2026-10-02': { holiday: 'Gandhi Jayanti' },
  '2026-10-10': { booking: 'Wedding reception, 18:00–23:00' },
  '2026-10-11': { booking: 'Wedding reception, 10:00–14:00' },
  '2026-10-17': { birthdays: ['Asha'] },
  '2026-10-20': { festival: 'Dussehra', holiday: 'Dussehra' },
  '2026-10-24': { booking: 'Yoga camp, 06:00–09:00', birthdays: ['Meera'] },
  // A festival that is a holiday, on a Sunday, with a birthday.
  '2026-11-08': { festival: 'Diwali', holiday: 'Diwali', birthdays: ['Ravi'] },
  '2026-11-14': { booking: "Children's day fair, 09:00–17:00" },
  '2026-11-24': { festival: 'Guru Nanak Jayanti' },
  '2026-12-25': { festival: 'Christmas', holiday: 'Christmas' },
};

function fetchHallDays(start: string, end: string): Promise<Record<string, HallDay>> {
  const inRange = Object.entries(EVENTS).filter(([date]) => date >= start && date <= end);
  return new Promise((resolve) => setTimeout(() => resolve(Object.fromEntries(inRange)), 700));
}

const isWeekend = (date: string) => [0, 6].includes(new Date(date).getUTCDay());

/** The day's events, in words: for screen readers, the card and the list. */
function describe(day: HallDay | undefined): string[] {
  if (!day) return [];
  return [
    day.festival && `${day.festival} (festival)`,
    day.holiday && `${day.holiday}: public holiday`,
    ...(day.birthdays ?? []).map((name) => `${name}'s birthday`),
    day.booking && `Booked: ${day.booking}`,
  ].filter((line): line is string => !!line);
}

/** Your colours and shapes: festivals pink stars, birthdays rings, holidays the error red. */
const TAG_STYLES: CalendarProps['tagStyles'] = {
  festival: { color: '#db2777', mark: 'star' },
  birthday: { color: 'var(--color-status-info)', mark: 'ring' },
  holiday: { color: 'var(--color-status-error)', mark: 'dot' },
};

const mark = (color: string, shape: 'dot' | 'ring' | 'star'): CSSProperties => ({
  display: 'inline-block',
  inlineSize: shape === 'star' ? 10 : 7,
  blockSize: shape === 'star' ? 10 : 7,
  borderRadius: shape === 'star' ? 0 : '50%',
  background: shape === 'ring' ? 'none' : color,
  border: shape === 'ring' ? `1px solid ${color}` : undefined,
  clipPath:
    shape === 'star'
      ? 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      : undefined,
});

export default function CalendarHall() {
  const [days, setDays] = useState<Record<string, HallDay>>({});
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string | null>('2026-10-20');
  // The latest request wins: a slow reply for a month already left is dropped.
  const latest = useRef('');

  const load = ({ start, end }: { start: string; end: string }) => {
    const key = `${start}/${end}`;
    latest.current = key;
    setLoading(true);
    fetchHallDays(start, end).then((result) => {
      if (latest.current !== key) return;
      setDays((known) => ({ ...known, ...result }));
      setLoading(false);
    });
  };

  const selected = date ? describe(days[date]) : [];

  return (
    <Stack direction="row" gap="lg" wrap align="start" style={{ inlineSize: '100%' }}>
      <Stack gap="sm">
        <Calendar
          aria-label="Community hall"
          locale="en-US"
          value={date}
          onValueChange={setDate}
          onVisibleRangeChange={load}
          loading={loading}
          // Booked first, then festivals over holidays: your order, not the built-in one.
          tagPriority={['booked', 'festival', 'holiday', 'birthday']}
          tagStyles={TAG_STYLES}
          getDayInfo={(day) => {
            const info = days[day];
            const lines = describe(info);
            return {
              tags: [
                isWeekend(day) && 'weekend',
                info?.booking && 'booked',
                info?.festival && 'festival',
                info?.holiday && 'holiday',
                (info?.birthdays?.length ?? 0) > 0 && 'birthday',
              ],
              description: lines.join(', ') || undefined,
              details: lines.length > 0 && (
                <ul>
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ),
            };
          }}
        />
        {/* The legend: every mark the calendar may draw, in words. */}
        <Stack direction="row" gap="sm" wrap>
          <Text size="xs" color="secondary">
            <span style={mark('var(--color-status-error)', 'dot')} /> Holiday
          </Text>
          <Text size="xs" color="secondary">
            <span style={mark('#db2777', 'star')} /> Festival
          </Text>
          <Text size="xs" color="secondary">
            <span style={mark('var(--color-status-info)', 'ring')} /> Birthday
          </Text>
          <Text size="xs" color="secondary">
            <s>12</s> Booked
          </Text>
        </Stack>
      </Stack>

      {/* The chosen day's events, beside the calendar: the full list, for every input. */}
      <Stack gap="2xs" style={{ minInlineSize: '12rem' }} aria-live="polite">
        <Text weight="semibold">{date ?? 'No day chosen'}</Text>
        {loading && (
          <Text size="sm" color="secondary">
            Loading…
          </Text>
        )}
        {!loading && selected.length === 0 && (
          <Text size="sm" color="secondary">
            Nothing on: the hall is free.
          </Text>
        )}
        {selected.map((line) => (
          <Text key={line} size="sm">
            {line}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}
