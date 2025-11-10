import { z } from "zod";
import type { ToolDefinition } from "../types/chat";

const weatherSchema = z.object({
  location: z.string().describe("City name (e.g., 'Paris', 'New York')"),
});

const fallbackWeatherData: Record<string, { temp: number; condition: string; humidity: number }> = {
  paris: { temp: 18, condition: "sunny", humidity: 65 },
  london: { temp: 14, condition: "cloudy", humidity: 78 },
  "new york": { temp: 22, condition: "partly cloudy", humidity: 55 },
  tokyo: { temp: 26, condition: "sunny", humidity: 70 },
  sydney: { temp: 20, condition: "rainy", humidity: 85 },
};

async function fetchWeatherFromWttr(location: string) {
  const endpoint = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`wttr.in error: ${response.status}`);
  }

  const json = await response.json();
  const current = json?.current_condition?.[0];

  if (!current) {
    throw new Error("wttr.in response missing current conditions");
  }

  return {
    temperature: Number.parseFloat(current.temp_C),
    condition: current.weatherDesc?.[0]?.value ?? "Unknown",
    humidity: Number.parseFloat(current.humidity),
    feelsLike: Number.parseFloat(current.FeelsLikeC),
  };
}

async function fetchWeatherFromProxy(location: string, apiProxyUrl: string) {
  const response = await fetch(apiProxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location }),
  });

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return await response.json();
}

type WeatherArgs = z.infer<typeof weatherSchema>;

/**
 * Creates a weather tool that fetches current weather data.
 *
 * @param options.apiProxyUrl - Optional API proxy URL (recommended for client-side usage to avoid CORS)
 * @returns A ToolDefinition for weather lookups
 *
 * @example
 * ```tsx
 * // Client-side with API proxy
 * const weatherTool = createWeatherTool({ apiProxyUrl: '/api/weather' });
 *
 * // Server-side direct access
 * const weatherTool = createWeatherTool();
 * ```
 */
export function createWeatherTool(options: { apiProxyUrl?: string } = {}): ToolDefinition {
  const { apiProxyUrl } = options;

  return {
    name: "get_weather",
    description: "Get current weather information for a specific location",
    schema: weatherSchema,
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name (e.g., 'Paris', 'New York')",
        },
      },
      required: ["location"],
    },
    run: async (args: WeatherArgs) => {
      const { location } = args;
      const normalized = location.toLowerCase();

      try {
        // Use API proxy if provided, otherwise direct access
        if (apiProxyUrl) {
          return await fetchWeatherFromProxy(location, apiProxyUrl);
        } else {
          const live = await fetchWeatherFromWttr(location);
          return {
            location,
            temperatureC: live.temperature,
            feelsLikeC: live.feelsLike,
            condition: live.condition,
            humidity: live.humidity,
            unit: "celsius",
            source: "wttr.in",
          };
        }
      } catch (error) {
        console.warn("[weatherTool] Falling back to mock data:", error);
        const fallback = fallbackWeatherData[normalized] || { temp: 20, condition: "clear", humidity: 60 };

        return {
          location,
          temperatureC: fallback.temp,
          feelsLikeC: fallback.temp,
          condition: fallback.condition,
          humidity: fallback.humidity,
          unit: "celsius",
          source: "fallback",
        };
      }
    },
  };
}

// Default export for backwards compatibility (uses direct wttr.in access)
export const weatherTool = createWeatherTool();
