export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location } = body;

    if (!location || typeof location !== "string") {
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ error: `wttr.in error: ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = await response.json();
    const current = json?.current_condition?.[0];

    if (!current) {
      return new Response(
        JSON.stringify({ error: "wttr.in response missing current conditions" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
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

    return new Response(JSON.stringify(weatherData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch weather data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
