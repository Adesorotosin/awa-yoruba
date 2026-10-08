import { NextResponse } from "next/server";
import { createSession, setPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestSessionToken } from "@/lib/guestSession";

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

    const guestToken = await getGuestSessionToken();

    if (guestToken) {
      await db.$transaction(async (tx) => {
        const guestSession = await tx.guestSession.findUnique({
          where: { sessionToken: guestToken },
          include: {
            challengeAttempts: {
              where: { rewardAmount: { gt: 0 } },
              include: { learningCredit: true },
              orderBy: { completedAt: "desc" },
              take: 1,
            },
          },
        });

        if (!guestSession || guestSession.isClaimed || guestSession.userId) return;

        const attempt = guestSession.challengeAttempts[0];

        if (attempt && !attempt.learningCredit) {
          await tx.learningCredit.create({
            data: {
              userId: user.id,
              amount: attempt.rewardAmount,
              currency: "NGN",
              source: "WELCOME_CHALLENGE",
              attemptId: attempt.id,
              status: "AVAILABLE",
            },
          });
        }

        await tx.guestSession.update({
          where: { id: guestSession.id },
          data: {
            userId: user.id,
            isClaimed: true,
            pendingPoints: 0,
          },
        });
      });
    }

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
