---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
---

DatePicker and DateRangePicker with `withTime` now set the time in the popup too: a native time field — "Time", or "Start time" and "End time" — under the calendar, and a Done button. A pick leaves the popup open so the time can follow; without `withTime` it still closes. A time chosen before any date is used by the first pick. Headless adds `DatePicker.TimeInput`, `StartTimeInput`, `EndTimeInput` and `Close`, and the `time`, `startTime` and `endTime` labels; ui adds `doneLabel`.
