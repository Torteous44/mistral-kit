import { POST as weatherPOST } from "@matthewporteous/mistral-kit/next/api/weather";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const POST = weatherPOST;
