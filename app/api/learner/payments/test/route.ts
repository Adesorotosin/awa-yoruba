import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Test payments are only available in development." }, { status: 404 });
  }

  try {
    const user = await requireUser();

    if (user.role !== "LEARNER") {
      return NextResponse.json({ error: "Learner access required." }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const bookingId = String(body.bookingId ?? "").trim();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, learnerId: user.id },
      });

      if (!booking) throw new Error("BOOKING_NOT_FOUND");

      if (!["AWAITING_PAYMENT", "CONFIRMED"].includes(booking.status)) {
        throw new Error("BOOKING_NOT_READY");
      }

      if (booking.paymentStatus === "PAID") {
        return { booking, payment: await tx.payment.findUnique({ where: { bookingId } }) };
      }

      const now = new Date();
      const credits = await tx.learningCredit.findMany({
        where: {
          userId: user.id,
          status: "AVAILABLE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: { createdAt: "asc" },
      });

      let remaining = booking.priceAmount;
      let discountAmount = 0;

      for (const credit of credits) {
        if (remaining <= 0) break;

        const applied = Math.min(credit.amount, remaining);
        remaining -= applied;
        discountAmount += applied;

        if (applied === credit.amount) {
          await tx.learningCredit.update({
            where: { id: credit.id },
            data: {
              status: "REDEEMED",
              bookingId: booking.id,
            },
          });
        } else {
          await tx.learningCredit.update({
            where: { id: credit.id },
            data: {
              amount: credit.amount - applied,
            },
          });

          await tx.learningCredit.create({
            data: {
              userId: credit.userId,
              amount: applied,
              currency: credit.currency,
              source: credit.source,
              bookingId: booking.id,
              status: "REDEEMED",
            },
          });
        }
      }

      const totalAmount = Math.max(0, booking.priceAmount - discountAmount);
      const providerReference = "TEST-" + randomBytes(8).toString("hex");

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          provider: "TEST",
          providerReference,
          amount: totalAmount,
          currency: booking.currency,
          status: "PAID",
          paidAt: now,
          metadata: JSON.stringify({
            environment: "development",
            discountAmount,
          }),
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          discountAmount,
          totalAmount,
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      });

      return { booking: updatedBooking, payment };
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      payment: result.payment,
      message: "Development payment completed successfully.",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "Please log in." }, { status: 401 });
      }
      if (error.message === "BOOKING_NOT_FOUND") {
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }
      if (error.message === "BOOKING_NOT_READY") {
        return NextResponse.json({ error: "This booking is not ready for payment." }, { status: 409 });
      }
    }

    console.error("Development payment error:", error);
    return NextResponse.json({ error: "Unable to complete test payment." }, { status: 500 });
  }
}
