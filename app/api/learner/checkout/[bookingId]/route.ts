import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const user = await requireUser();

    if (user.role !== "LEARNER") {
      return NextResponse.json({ error: "Learner access required." }, { status: 403 });
    }

    const { bookingId } = await params;

    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        learnerId: user.id,
      },
      include: {
        tutorProfile: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (!["AWAITING_PAYMENT", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "This booking is not ready for checkout." },
        { status: 409 },
      );
    }

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({
        alreadyPaid: true,
        booking,
        amountDue: 0,
        availableCredit: 0,
      });
    }

    const now = new Date();
    const credits = await db.learningCredit.findMany({
      where: {
        userId: user.id,
        status: "AVAILABLE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "asc" },
    });

    const availableCredit = credits.reduce((sum, credit) => sum + credit.amount, 0);
    const discountAmount = Math.min(booking.priceAmount, availableCredit);
    const amountDue = Math.max(0, booking.priceAmount - discountAmount);

    return NextResponse.json({
      alreadyPaid: false,
      booking,
      priceAmount: booking.priceAmount,
      discountAmount,
      amountDue,
      currency: booking.currency,
      availableCredit,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    console.error("Learner checkout GET error:", error);
    return NextResponse.json({ error: "Unable to load checkout." }, { status: 500 });
  }
}
