import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { setPassword } from "@/lib/auth";
import { db } from "@/lib/db";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Your new password must be at least 8 characters." }, { status: 400 });
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      if (resetToken) {
        await db.passwordResetToken.delete({ where: { id: resetToken.id } }).catch(() => undefined);
      }
      return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    await setPassword(resetToken.userId, password);

    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
      db.session.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your password has been reset. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset your password right now. Please try again." }, { status: 500 });
  }
}
