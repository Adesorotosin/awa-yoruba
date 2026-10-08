import { NextResponse } from "next/server";
import { createSession, verifyUserPassword } from "@/lib/auth";
import { claimGuestLearningCredit } from "@/lib/learningCredits";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await verifyUserPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await claimGuestLearningCredit(user.id);

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role, tutorProfileId: user.tutorProfile?.id ?? null },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to log you in." }, { status: 500 });
  }
}
