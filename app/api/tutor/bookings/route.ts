import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_ACTIONS = ["confirm", "reject", "complete"] as const;
type BookingAction = (typeof ALLOWED_ACTIONS)[number];

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tutorId = String(body.tutorId ?? "").trim();
    const bookingId = String(body.bookingId ?? "").trim();
    const action = String(body.action ?? "") as BookingAction;

    if (!tutorId || !bookingId || !ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Tutor, booking and valid action are required." }, { status: 400 });
    }

    const tutor = await db.tutorProfile.findUnique({
      where: { id: tutorId },
      select: { id: true, userId: true },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    }

    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        tutorId: tutor.userId,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found for this tutor." }, { status: 404 });
    }

    const nextStatus =
      action === "confirm"
        ? "CONFIRMED"
        : action === "reject"
          ? "CANCELLED"
          : "COMPLETED";

    if (action === "confirm" && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bookings can be confirmed." }, { status: 409 });
    }

    if (action === "reject" && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bookings can be rejected." }, { status: 409 });
    }

    if (action === "complete" && booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Only confirmed bookings can be completed." }, { status: 409 });
    }

    const updatedBooking = await db.booking.update({
      where: { id: booking.id },
      data: { status: nextStatus },
      include: {
        learner: true,
        learnerProfile: true,
        childProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message:
        action === "confirm"
          ? "Booking confirmed."
          : action === "reject"
            ? "Booking request declined."
            : "Lesson marked as completed.",
    });
  } catch (error) {
    console.error("Tutor booking action error:", error);
    return NextResponse.json({ error: "Unable to update booking." }, { status: 500 });
  }
}
