---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

DatePicker and DateRangePicker with `withTime` now set the time in the popup too: a native time field — "Time", or "Start time" and "End time" — under the calendar, and a Done button. A pick leaves the popup open so the time can follow; without `withTime` it still closes. A time chosen before any date is used by the first pick. Headless adds `DatePicker.TimeInput`, `StartTimeInput`, `EndTimeInput` and `Close`, and the `time`, `startTime` and `endTime` labels; ui adds `doneLabel`.

Calendars can jump to a month and year, for dates far away such as a date of birth: `captionLayout="dropdown"` on Calendar, RangeCalendar, DatePicker and DateRangePicker shows native month and year selects. The years run from `min`'s to `max`'s, or 100 years back to 10 ahead. Headless adds `Calendar.MonthSelect` and `Calendar.YearSelect`, and the `month` and `year` labels. Tokens: `--calendar-select-*`.

DateRangePicker takes `maxHours` with `withTime`: the most hours from start to end, such as a 40-hour booking. The calendar disables the days out of reach, a picked end past the cap is pulled back to it, and the end input's `max` stops a typed one.
