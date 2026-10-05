---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `Calendar`, `RangeCalendar`, `DatePicker` and `DateRangePicker`. Dates are ISO strings in the user's local time: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with `withTime`; a value with `Z` or an offset is converted to local time. The field is a native `<input type="date">` or `datetime-local`, so typing, the phone's picker, the form and react-hook-form's `register()` work, and a calendar in a popover picks for it. A range has two inputs and a range calendar picked in two presses; `maxDays` limits its length in days, both ends counted, in the calendar and through the end input's `max`. `min`, `max` and `isDateUnavailable` limit both the inputs and the calendar. The calendar follows the APG grid keyboard and the locale's names and first day of the week. Headless subpaths `@arun-dev/headless/calendar` and `@arun-dev/headless/date-picker`. `@arun-dev/ui` requires `@arun-dev/headless` 4.23.0 or later. Tokens: `--calendar-*`, `--date-picker-*`.
