# weatherTool
Default instance of the weather lookup tool created via `createWeatherTool()` with direct calls to wttr.in. Use this when you can make outgoing network requests from the environment running the tool.

## Usage
```tsx
import { weatherTool } from "@matthewporteous/mistral-kit";

const result = await weatherTool.run({ location: "Paris" });
// { location: "Paris", temperatureC: 18, feelsLikeC: 18, condition: "Sunny", humidity: 65, unit: "celsius", source: "wttr.in" }
```

## Input Schema
```ts
{
  location: string; // City or location string
}
```

## Output
```ts
{
  location: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  humidity: number;
  unit: "celsius";
  source: "wttr.in" | "fallback";
}
```

## Notes
* When wttr.in fails or returns malformed data, the tool falls back to mock weather values for a handful of predefined cities (Paris, London, New York, Tokyo, Sydney) or a generic clear day.
* For client-side usage (to avoid CORS), instantiate your own proxy-specific version with `createWeatherTool({ apiProxyUrl: "/api/weather" })`.
