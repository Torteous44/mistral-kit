export const runtime = "edge";
export const dynamic = "force-dynamic";

const buildJsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location } = body ?? {};

    if (!location || typeof location !== "string") {
      return buildJsonResponse({ error: "Location is required" }, { status: 400 });
    }

    const endpoint = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "mistral-kit/1.0",
      },
    });

    if (!response.ok) {
      return buildJsonResponse({ error: `wttr.in error: ${response.status}` }, { status: response.status });
    }

    const json = await response.json();
    const current = json?.current_condition?.[0];

    if (!current) {
      return buildJsonResponse({ error: "wttr.in response missing current conditions" }, { status: 500 });
    }

    const weatherData = {
      location,
      temperatureC: Number.parseFloat(current.temp_C),
      feelsLikeC: Number.parseFloat(current.FeelsLikeC),
      condition: current.weatherDesc?.[0]?.value ?? "Unknown",
      humidity: Number.parseFloat(current.humidity),
      unit: "celsius",
      source: "wttr.in",
    };

    return buildJsonResponse(weatherData, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return buildJsonResponse({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
