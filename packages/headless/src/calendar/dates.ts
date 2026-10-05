/**
 * Calendar dates as ISO strings, `YYYY-MM-DD`: a day on the calendar, in no time zone. They
 * compare as strings, so `a < b` orders them. Arithmetic goes through a `Date` at UTC midnight,
 * where every day is 24 hours long. Internal (decision 9): shared by Calendar and DatePicker.
 */

const MS_PER_DAY = 86_400_000;

/** The `Date` at UTC midnight of an ISO date. */
function toUTC(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = toUTC(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUTC(date);
}

/** The same day `months` later, or the month's last day when it is shorter: Jan 31 → Feb 28. */
export function addMonths(iso: string, months: number): string {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d, last));
  return fromUTC(first);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 8)}01`;
}

export function endOfMonth(iso: string): string {
  return addDays(addMonths(startOfMonth(iso), 1), -1);
}

/** Days from `a` to `b`: 0 for the same day, negative when `b` is earlier. */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / MS_PER_DAY);
}

/** 0 for Sunday to 6 for Saturday. */
export function dayOfWeek(iso: string): number {
  return toUTC(iso).getUTCDay();
}

export function clamp(iso: string, min: string | undefined, max: string | undefined): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

function pad(n: number, length = 2): string {
  return String(n).padStart(length, '0');
}

/** Today, on the device's calendar. */
export function today(): string {
  const now = new Date();
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const DATE = /^(\d{4}-\d{2}-\d{2})$/;
// Seconds and fractions may follow the minutes; a zone may not.
const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})[\d:.]*$/;

/**
 * Any ISO 8601 date or date-time as the value a native input holds: `YYYY-MM-DD`, or with
 * `withTime` `YYYY-MM-DDTHH:mm`. A value with no zone is the wall time it says; one with `Z` or
 * an offset is converted to the device's time zone. Seconds are dropped. `null` for an empty or
 * unreadable value.
 */
export function toInputValue(value: string | null | undefined, withTime: boolean): string | null {
  if (!value) return null;
  let date: string;
  let time = '00:00';
  const plain = DATE.exec(value);
  const local = LOCAL_DATE_TIME.exec(value);
  if (plain?.[1]) date = plain[1];
  else if (local?.[1] && local[2]) {
    date = local[1];
    time = local[2];
  } else {
    // A zone: let the platform convert it to local time.
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    date = `${pad(parsed.getFullYear(), 4)}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
    time = `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
  }
  return withTime ? `${date}T${time}` : date;
}

/** The date part of an input value. */
export function datePart(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

/** The time part of a date-time input value, `HH:mm`, or `null` for a date. */
export function timePart(value: string | null | undefined): string | null {
  return value && value.length > 10 ? value.slice(11, 16) : null;
}

/**
 * A local date-time `hours` later, as an input value: elapsed time, so across a daylight-saving
 * change the wall clock moves by an hour more or less.
 */
export function addHours(value: string, hours: number): string {
  const date = new Date(value);
  date.setTime(date.getTime() + hours * 3_600_000);
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * The calendar days a span of `hours` can touch from a start at `time` (`HH:mm`), both ends
 * counted: 40 hours from 14:00 ends at 06:00 on the third day.
 */
export function daysSpanned(time: string, hours: number): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return Math.floor((h * 60 + m + hours * 60) / 1440) + 1;
}

/* ── Locale ── */

const formatters = new Map<string, Intl.DateTimeFormat>();

/** A formatter for UTC dates, cached: the calendar formats every day of every visible month. */
export function formatter(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
    formatters.set(key, cached);
  }
  return cached;
}

export function formatDate(
  iso: string,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  return formatter(locale, options).format(toUTC(iso));
}

export function formatDateRange(
  start: string,
  end: string,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  return formatter(locale, options).formatRange(toUTC(start), toUTC(end));
}

/** Regions whose weeks start on Sunday, for engines without `Intl.Locale#getWeekInfo`. */
const SUNDAY_FIRST = new Set(
  'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(
    ' ',
  ),
);

type WeekInfoLocale = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
};

/** The day a week starts on in this locale: 0 for Sunday to 6 for Saturday. */
export function firstDayOfWeekFor(locale: string | undefined): number {
  try {
    const resolved = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
    const intlLocale = new Intl.Locale(resolved) as WeekInfoLocale;
    // 1 for Monday to 7 for Sunday.
    const firstDay = intlLocale.getWeekInfo?.().firstDay ?? intlLocale.weekInfo?.firstDay;
    if (firstDay) return firstDay % 7;
    const region = intlLocale.maximize().region ?? '';
    return SUNDAY_FIRST.has(region) ? 0 : 1;
  } catch {
    return 0;
  }
}
