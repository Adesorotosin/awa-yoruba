// src/app/api/trial/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGuestSessionToken } from "@/lib/guestSession";

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

    if (guestToken) {
      guestSession = await db.guestSession.findUnique({
        where: { sessionToken: guestToken },
      });
    }

    const pendingPoints = guestSession && !guestSession.isClaimed ? guestSession.pendingPoints : 0;

    // 3. Perform database operations inside a single transaction
    const result = await db.$transaction(async (tx) => {
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
      if (pendingPoints > 0) {
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
      if (guestSession) {
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
Let's pick that thread right back up and build out **`src/app/api/trial/route.ts`**. 

In Next.js (App Router), this endpoint will handle the POST request when a user signs up for a trial. It will create or update their trial status in the database and execute the transaction logic to award or transfer initial reward/trial points.

Here is the implementation:

```typescript
// src/app/api/trial/route.ts

import { NextRequest, NextResponse } from "next/server";
// Import your DB client (e.g., Prisma, Supabase, Drizzle, or Mongoose)
// import { db } from "@/lib/db"; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, trialType, initialPoints = 100 } = body;

    // 1. Basic Validation
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required for trial registration." },
        { status: 400 }
      );
    }

    // 2. Check if user has already claimed/registered for a trial
    /*
    const existingTrial = await db.trial.findUnique({
      where: { userId },
    });

    if (existingTrial) {
      return NextResponse.json(
        { error: "Trial has already been activated for this account." },
        { status: 400 }
      );
    }
    */

    // 3. Execute DB Transaction: Activate Trial & Award/Transfer Points
    /*
    const result = await db.$transaction(async (tx) => {
      // Step A: Record Trial Registration
      const newTrial = await tx.trial.create({
        data: {
          userId,
          type: trialType || "STANDARD_TRIAL",
          status: "ACTIVE",
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        },
      });

      // Step B: Update User Point Balance / Ledger Entry
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          pointsBalance: {
            increment: initialPoints,
          },
        },
      });

      // Step C: Log the Point Transfer Transaction
      const transactionRecord = await tx.pointTransaction.create({
        data: {
          userId,
          amount: initialPoints,
          type: "TRIAL_GRANT",
          description: "Initial point balance granted for trial registration",
        },
      });

      return { newTrial, updatedUser, transactionRecord };
    });
    */

    // Mocked Success Response for testing front-end integration
    const mockData = {
      success: true,
      message: "Trial successfully activated and points transferred.",
      data: {
        userId,
        trialStatus: "ACTIVE",
        pointsTransferred: initialPoints,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    return NextResponse.json(mockData, { status: 201 });
  } catch (error: any) {
    console.error("Error in trial registration:", error);
    return NextResponse.json(
      { error: "Failed to process trial registration and point transfer." },
      { status: 500 }
    );
  }
}