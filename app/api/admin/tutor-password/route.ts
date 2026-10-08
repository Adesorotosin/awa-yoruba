import { NextResponse } from "next/server";
import { setPassword } from "@/lib/auth";
import { db } from "@/lib/db";

function authorized(request: Request) {
  const configured = process.env.ADMIN_KEY;
  const provided = request.headers.get("x-admin-key");
  return Boolean(configured && provided && configured === provided);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tutorProfileId = String(body.tutorProfileId ?? "").trim();
    const password = String(body.password ?? "");

    if (!tutorProfileId || password.length < 8) {
      return NextResponse.json({ error: "Tutor profile ID and a password of at least 8 characters are required." }, { status: 400 });
    }

    const tutor = await db.tutorProfile.findUnique({ where: { id: tutorProfileId }, select: { userId: true } });
    if (!tutor) return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });

    await setPassword(tutor.userId, password);
    return NextResponse.json({ success: true, message: "Tutor login password set successfully." });
  } catch (error) {
    console.error("Admin tutor password error:", error);
    return NextResponse.json({ error: "Unable to set tutor password." }, { status: 500 });
  }
}
