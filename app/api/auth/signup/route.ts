import { NextResponse } from "next/server";
import { createSession, setPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { claimGuestLearningCredit } from "@/lib/learningCredits";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !email.includes("@") || password.length < 8) {
      return NextResponse.json({ error: "Name, valid email and a password of at least 8 characters are required." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    }

    const user = await db.user.create({
      data: { name, email, role: "LEARNER" },
    });

    await setPassword(user.id, password);

    await claimGuestLearningCredit(user.id);

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Unable to create your account." }, { status: 500 });
  }
}
