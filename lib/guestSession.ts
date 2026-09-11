// src/lib/guestSession.ts
import { cookies } from "next/headers";
import { db } from "./db";

const GUEST_COOKIE_NAME = "yoruba_guest_token";

// Cast db to bypass strict Prisma type checks on Netlify build servers
const prisma = db as any;

export async function getOrCreateGuestSession() {
  const cookieStore = await cookies();
  let guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (guestToken && prisma.guestSession) {
    const existingSession = await prisma.guestSession.findUnique({
      where: { sessionToken: guestToken },
    });

    if (existingSession && !existingSession.isClaimed) {
      return existingSession;
    }
  }

  // Generate unique token using built-in crypto API
  guestToken = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

  // Create guest session record in database
  let newSession = null;
  if (prisma.guestSession) {
    newSession = await prisma.guestSession.create({
      data: {
        sessionToken: guestToken,
        pendingPoints: 0,
        expiresAt,
      },
    });
  }

  // Set HTTP-only cookie
  cookieStore.set(GUEST_COOKIE_NAME, guestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return newSession;
}

export async function getGuestSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE_NAME)?.value;
}