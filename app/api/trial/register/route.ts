import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentName, email, phone, childName, childAge, unlockedReward } = body;

    // 1. Basic validation
    if (!parentName || !email || !childName) {
      return NextResponse.json(
        { error: "Missing required fields (parentName, email, childName)" },
        { status: 400 }
      );
    }

    // Parse age safely (extracts digits if passed as "8 years old" or numbers)
    const parsedAge = childAge
      ? parseInt(String(childAge).replace(/\D/g, ""), 10) || null
      : null;

    // 2. Database Transaction: Create/Update Parent User & Create Trial Booking
    const result = await db.$transaction(async (tx) => {
      // Find or create parent user record using upsert for atomic execution & strict typing
      const user = await tx.user.upsert({
        where: { email },
        update: {
          name: parentName,
          phone: phone || undefined,
          points: {
            increment: 50,
          },
        },
        create: {
          name: parentName,
          email,
          phone,
          role: "PARENT",
          points: 50, // Initial spin reward bonus points
        },
      });

      // Create Trial Booking entry connected to parent
      const booking = await tx.trialBooking.create({
        data: {
          userId: user.id,
          parentName,
          childName,
          childAge: parsedAge,
          phone,
          unlockedReward: unlockedReward || null,
          status: "PENDING",
        },
      });

      return { user, booking };
    });

    return NextResponse.json(
      {
        message: "Trial booking successfully registered!",
        bookingId: result.booking.id,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          points: result.user.points,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[TRIAL_REGISTER_ERROR]:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}