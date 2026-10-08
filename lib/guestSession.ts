import { cookies } from "next/headers";
import { db } from "./db";

const GUEST_COOKIE_NAME = "yoruba_guest_token";

const prisma = db as any;

export async function getOrCreateGuestSession() {
  const cookieStore = await cookies();
  let guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (guestToken && prisma.guestSession) {
    const existingSession = await prisma.guestSession.findUnique({
      where: { sessionToken: guestToken },
    });

    if (existingSession) {
      return existingSession;
    }
  }

  guestToken = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const newSession = await prisma.guestSession.create({
    data: {
      sessionToken: guestToken,
      pendingPoints: 0,
      expiresAt,
    },
  });

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
