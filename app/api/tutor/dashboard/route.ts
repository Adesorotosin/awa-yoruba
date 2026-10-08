import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireTutor();
    const tutor = user.tutorProfile!;

    const bookings = await db.booking.findMany({
      where: {
        tutorId: user.id,
        scheduledAt: { gte: new Date() },
        status: { in: ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"] },
      },
      include: { learner: true, learnerProfile: true, childProfile: true },
      orderBy: { scheduledAt: "asc" },
    });

    const completedCount = await db.booking.count({
      where: { tutorId: user.id, status: "COMPLETED" },
    });

    return NextResponse.json({
      tutor: {
        id: tutor.id,
        userId: tutor.userId,
        displayName: tutor.displayName,
        bio: tutor.bio,
        hourlyRate: tutor.hourlyRate,
        currency: tutor.currency,
        applicationStatus: tutor.applicationStatus,
        verificationStatus: tutor.verificationStatus,
        isPublished: tutor.isPublished,
        averageRating: tutor.averageRating,
        totalReviews: tutor.totalReviews,
      },
      availability: await db.tutorAvailability.findMany({
        where: { tutorProfileId: tutor.id, isActive: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
      bookings,
      stats: {
        pendingBookings: bookings.filter((booking) => ["PENDING", "AWAITING_PAYMENT"].includes(booking.status)).length,
        upcomingBookings: bookings.length,
        completedLessons: completedCount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    console.error("Tutor dashboard GET error:", error);
    return NextResponse.json({ error: "Unable to load tutor dashboard." }, { status: 500 });
  }
}
