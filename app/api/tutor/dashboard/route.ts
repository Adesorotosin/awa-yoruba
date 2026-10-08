import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tutorId = String(url.searchParams.get("tutorId") ?? "").trim();

    if (!tutorId) {
      return NextResponse.json({ error: "Tutor profile ID is required." }, { status: 400 });
    }

    const tutor = await db.tutorProfile.findFirst({
      where: { id: tutorId },
      include: {
        user: true,
        availability: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    }

    const bookings = await db.booking.findMany({
      where: {
        tutorId: tutor.userId,
        scheduledAt: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        learner: true,
        learnerProfile: true,
        childProfile: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    const completedCount = await db.booking.count({
      where: { tutorId: tutor.userId, status: "COMPLETED" },
    });

    const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;

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
      availability: tutor.availability,
      bookings,
      stats: {
        pendingBookings: pendingCount,
        upcomingBookings: bookings.length,
        completedLessons: completedCount,
      },
    });
  } catch (error) {
    console.error("Tutor dashboard GET error:", error);
    return NextResponse.json({ error: "Unable to load tutor dashboard." }, { status: 500 });
  }
}
