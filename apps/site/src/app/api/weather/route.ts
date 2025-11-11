import { POST as weatherPOST } from "@mistral/ui/next/api/weather";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const POST = weatherPOST;
