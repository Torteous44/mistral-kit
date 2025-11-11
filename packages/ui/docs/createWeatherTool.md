# createWeatherTool
Factory that returns a `ToolDefinition` for fetching weather either via a custom API proxy or directly from wttr.in. Pass `apiProxyUrl` when running in browsers (to avoid CORS) or edge runtimes where you already exposed `/api/weather`.

## Usage
```tsx
import { createWeatherTool } from "@matthewporteous/mistral-kit";

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });
const result = await weatherTool.run({ location: "Lisbon" });
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| apiProxyUrl | `string` | true |  | When provided, the tool POSTs `{ location }` to this URL instead of calling wttr.in directly. |

## Input/Output
Same schema/output as [weatherTool](./weatherTool.md).

## Notes
* When `apiProxyUrl` is omitted, the tool fetches `https://wttr.in/{location}?format=j1` with cache disabled.
* Failures automatically fall back to the mock dataset used by the default `weatherTool` instance.
