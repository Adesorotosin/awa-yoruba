// src/app/api/trial/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGuestSessionToken } from "@/lib/guestSession";

// Type assertion helper to bypass missing Prisma Client type definitions
const prisma = db as any;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentName, childName, email, phone, unlockedReward } = body;

    // 1. Basic validation
    if (!parentName || !childName || !email) {
      return NextResponse.json(
        { error: "Parent name, child name, and email are required." },
        { status: 400 }
      );
    }

    // 2. Fetch the guest token from cookies
    const guestToken = await getGuestSessionToken();
    let guestSession = null;

    if (guestToken && prisma.guestSession) {
      guestSession = await prisma.guestSession.findUnique({
        where: { sessionToken: guestToken },
      });
    }

    const pendingPoints =
      guestSession && !guestSession.isClaimed ? guestSession.pendingPoints : 0;

    // 3. Perform database operations inside a single transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create or update Parent User account
      const parentUser = await tx.user.upsert({
        where: { email },
        update: {
          fullName: parentName,
          phoneNumber: phone || null,
        },
        create: {
          email,
          fullName: parentName,
          phoneNumber: phone || null,
          role: "PARENT",
        },
      });

      // Create Child Profile linked to Parent
      const childProfile = await tx.childProfile.create({
        data: {
          parentId: parentUser.id,
          name: childName,
          totalPoints: pendingPoints, // Transfer guest points to permanent balance
        },
      });

      // Log point transfer in Point Ledger if points were claimed
      if (pendingPoints > 0 && tx.pointLedger) {
        await tx.pointLedger.create({
          data: {
            userId: parentUser.id,
            childId: childProfile.id,
            points: pendingPoints,
            reason: `Guest session trial transfer (${unlockedReward || "Game completion"})`,
          },
        });
      }

      // Mark the guest session as claimed so points cannot be reused
      if (guestSession && tx.guestSession) {
        await tx.guestSession.update({
          where: { id: guestSession.id },
          data: {
            isClaimed: true,
            claimedByUserId: parentUser.id,
          },
        });
      }

      return { parentUser, childProfile };
    });

    return NextResponse.json({
      success: true,
      message: "Trial registration completed successfully!",
      data: {
        parentId: result.parentUser.id,
        childId: result.childProfile.id,
        claimedPoints: pendingPoints,
      },
    });
  } catch (error) {
    console.error("Trial Registration Error:", error);
    return NextResponse.json(
      { error: "Failed to process trial registration." },
      { status: 500 }
    );
  }
}