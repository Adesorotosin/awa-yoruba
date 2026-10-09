import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const RESET_WINDOW_MS = 30 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  let tokenHash: string | undefined;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      console.error("Password reset email is not configured: RESEND_API_KEY or EMAIL_FROM is missing.");
      return NextResponse.json(
        { error: "Password recovery is not configured yet. Please try again later or contact support." },
        { status: 503 },
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    // Use the same response whether or not the account exists.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists for that email, a password reset link will be sent shortly.",
      });
    }

    const token = randomBytes(32).toString("hex");
    tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_WINDOW_MS);

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await db.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://awa-yoruba.vercel.app").replace(/\/$/, "");
    const resetUrl = baseUrl + "/reset-password?token=" + token;
    const greeting = escapeHtml(user.name?.trim() || "there");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your AWA Yoruba password",
        text: "Hello " + (user.name?.trim() || "there") + ",\n\nWe received a request to reset your AWA Yoruba password. Use this link within 30 minutes:\n" + resetUrl + "\n\nIf you did not request this, you can ignore this email.",
        html: '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#241C16;max-width:560px;margin:0 auto"><h1 style="color:#114B33">Reset your password</h1><p>Hello ' + greeting + ',</p><p>We received a request to reset your AWA Yoruba password. Use the button below within <strong>30 minutes</strong>.</p><p><a href="' + resetUrl + '" style="display:inline-block;background:#114B33;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold">Reset password</a></p><p>If the button does not work, copy this link into your browser:</p><p><a href="' + resetUrl + '">' + resetUrl + '</a></p><p>If you did not request this, you can safely ignore this email.</p><p>— AWA Yoruba</p></div>',
      }),
    });

    if (!emailResponse.ok) {
      const providerError = await emailResponse.text();
      console.error("Password reset email provider error:", providerError);
      await db.passwordResetToken.deleteMany({ where: { tokenHash } });
      tokenHash = undefined;
      return NextResponse.json(
        { error: "We couldn't send the reset email right now. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a password reset link will be sent shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    if (tokenHash) {
      await db.passwordResetToken.deleteMany({ where: { tokenHash } }).catch(() => undefined);
    }
    return NextResponse.json({ error: "Unable to process your request right now." }, { status: 500 });
  }
}
