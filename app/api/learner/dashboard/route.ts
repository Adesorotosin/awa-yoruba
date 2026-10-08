import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();

    if (user.role !== "LEARNER") {
      return NextResponse.json({ error: "Learner access required." }, { status: 403 });
    }

    const learnerProfile = await db.learnerProfile.findUnique({
      where: { userId: user.id },
      include: { currentLevel: true },
    });

    const bookings = await db.booking.findMany({
      where: { learnerId: user.id },
      include: {
        tutorProfile: { select: { id: true, displayName: true, photoUrl: true, averageRating: true } },
        level: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    });

    const now = new Date();
    const upcoming = bookings.filter(
      (booking) =>
        booking.scheduledAt >= now &&
        ["PENDING", "CONFIRMED"].includes(booking.status)
    );

    const completedLessons = bookings.filter((booking) => booking.status === "COMPLETED").length;
    const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;

    const credits = await db.learningCredit.findMany({
      where: {
        userId: user.id,
        status: "AVAILABLE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
    });

    const availableCredit = credits.reduce((sum, credit) => sum + credit.amount, 0);

    return NextResponse.json({
      learner: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        learnerProfileId: learnerProfile?.id ?? null,
        learningGoal: learnerProfile?.learningGoal ?? null,
        currentLevel: learnerProfile?.currentLevel
          ? {
              id: learnerProfile.currentLevel.id,
              name: learnerProfile.currentLevel.name,
              description: learnerProfile.currentLevel.description,
            }
          : null,
      },
      stats: {
        upcomingLessons: upcoming.length,
        pendingBookings,
        completedLessons,
        availableCredit,
      },
      bookings: bookings.slice(0, 6),
      credits,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    console.error("Learner dashboard error:", error);
    return NextResponse.json({ error: "Unable to load learner dashboard." }, { status: 500 });
  }
}