import { NextResponse } from "next/server";

/**
 * This legacy endpoint was empty and is not the active welcome-challenge API.
 * Keep an explicit handler so Next.js route type generation can validate the module
 * and direct any old callers to the supported endpoint.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "This legacy game endpoint is no longer available.",
      replacement: "/api/challenges/welcome",
    },
    { status: 410 },
  );
}
