---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Calendars can say what each day is. `getDayInfo(date)` returns `tags` (any number: holiday, festival, birthday, booked, weekend or your own), a `description` added to the day's spoken name, and `details` for a details card. Each day lists its tags in `data-tags` and shows one mark for its tag highest in `tagPriority` (`data-mark`); `tagStyles` sets each tag's colour and shape (dot, ring, star, diamond, bar, strike, none). The details card opens on a resting mouse, on keyboard focus or on a tap, and Esc hides it. `onVisibleRangeChange` reports the days shown so their information can be fetched, and `loading` marks the grid busy. All optional, on Calendar, RangeCalendar, DatePicker and DateRangePicker. Headless adds `Calendar.DayDetails` and `dayProps`. Tokens: `--calendar-tag-*`, `--calendar-details-*`, and status error, warning and success on the page join the contrast requirements.

Fix: a DateRangePicker with `maxHours` or `maxDays` could exceed its limit when the start moved after the end was set. Moving the start, typed or in the popup, now pulls an end past the limit back to it.
