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

type WeatherArgs = z.infer<typeof weatherSchema>;

export const weatherTool: ToolDefinition = {
  name: "get_weather",
  description: "Get current weather information for a specific location via wttr.in (no API key required)",
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
    let source: "wttr.in" | "fallback" = "wttr.in";

    try {
      const live = await fetchWeatherFromWttr(location);
      return {
        location,
        temperatureC: live.temperature,
        feelsLikeC: live.feelsLike,
        condition: live.condition,
        humidity: live.humidity,
        unit: "celsius",
        source,
      };
    } catch (error) {
      console.warn("[weatherTool] Falling back to mock data:", error);
      const fallback = fallbackWeatherData[normalized] || { temp: 20, condition: "clear", humidity: 60 };
      source = "fallback";

      return {
        location,
        temperatureC: fallback.temp,
        feelsLikeC: fallback.temp,
        condition: fallback.condition,
        humidity: fallback.humidity,
        unit: "celsius",
        source,
      };
    }
  },
};
