import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_ACTIONS = ["confirm", "reject", "complete"] as const;
type BookingAction = (typeof ALLOWED_ACTIONS)[number];

export async function PATCH(request: Request) {
  try {
    const tutor = await requireTutor();
    const body = (await request.json()) as Record<string, unknown>;
    const bookingId = String(body.bookingId ?? "").trim();
    const action = String(body.action ?? "") as BookingAction;

    if (!bookingId || !ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Booking and valid action are required." }, { status: 400 });
    }

    const booking = await db.booking.findFirst({ where: { id: bookingId, tutorId: tutor.id } });
    if (!booking) return NextResponse.json({ error: "Booking not found for this tutor." }, { status: 404 });

    if (action === "confirm" && booking.status !== "PENDING") return NextResponse.json({ error: "Only pending bookings can be confirmed." }, { status: 409 });
    if (action === "reject" && booking.status !== "PENDING") return NextResponse.json({ error: "Only pending bookings can be rejected." }, { status: 409 });
    if (action === "complete" && booking.status !== "CONFIRMED") return NextResponse.json({ error: "Only confirmed bookings can be completed." }, { status: 409 });

    const nextStatus = action === "confirm" ? "AWAITING_PAYMENT" : action === "reject" ? "CANCELLED" : "COMPLETED";
    const updatedBooking = await db.booking.update({
      where: { id: booking.id },
      data: { status: nextStatus },
      include: { learner: true, learnerProfile: true, childProfile: true },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message:
        action === "confirm"
          ? "Booking accepted. The learner can now complete payment."
          : action === "reject"
            ? "Booking request declined."
            : "Lesson marked as completed.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    console.error("Tutor booking action error:", error);
    return NextResponse.json({ error: "Unable to update booking." }, { status: 500 });
  }
}
