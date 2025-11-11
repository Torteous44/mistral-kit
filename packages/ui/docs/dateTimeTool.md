# dateTimeTool
Tool that returns the current date/time using the user’s locale/timezone. Helps the model ground responses when asked “what time is it?” without relying on internal knowledge.

## Usage
```tsx
import { dateTimeTool } from "@matthewporteous/mistral-kit";

const now = await dateTimeTool.run({});
// { date: "January 1, 2025", time: "09:15:04 AM", timestamp: "2025-01-01T14:15:04.123Z", timezone: "America/New_York" }
```

## Input Schema
Empty object (no parameters).

## Output
```ts
{
  date: string;          // locale string (en-US)
  time: string;          // hh:mm:ss (12-hour) string
  timestamp: string;     // ISO8601 timestamp
  timezone: string;      // resolved IANA timezone
}
```

## Notes
* Uses `new Date()` + `Intl.DateTimeFormat().resolvedOptions().timeZone` on the client—make sure your runtime clock/timezone is correct.
