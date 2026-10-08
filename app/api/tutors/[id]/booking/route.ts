import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const tutor = await db.tutorProfile.findFirst({
      where: {
        id,
        isPublished: true,
        applicationStatus: "APPROVED",
        verificationStatus: "VERIFIED",
      },
      select: {
        id: true,
        displayName: true,
        hourlyRate: true,
        availability: {
          where: { isActive: true },
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found." }, { status: 404 });
    }

    const currentUser = await getCurrentUser();

    return NextResponse.json({
      tutor,
      learner: currentUser?.role === "LEARNER"
        ? {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            children: await db.childProfile.findMany({
              where: { parentId: currentUser.id },
              select: { id: true, name: true, age: true },
              orderBy: { createdAt: "asc" },
            }),
          }
        : null,
    });
  } catch (error) {
    console.error("Tutor booking GET error:", error);
    return NextResponse.json({ error: "Unable to load booking details." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireUser();

    if (user.role !== "LEARNER") {
      return NextResponse.json({ error: "Only learner accounts can create bookings." }, { status: 403 });
    }

    const body = await request.json();
    const date = String(body.date ?? "").trim();
    const time = String(body.time ?? "").trim();
    const notes = String(body.notes ?? "").trim();
    const childProfileId = String(body.childProfileId ?? "").trim();

    if (!date || !time) {
      return NextResponse.json(
        { error: "Date and time are required." },
        { status: 400 },
      );
    }

    const childProfileIdValue = childProfileId || null;

    if (childProfileIdValue) {
      const child = await db.childProfile.findFirst({
        where: { id: childProfileIdValue, parentId: user.id },
        select: { id: true },
      });
      if (!child) {
        return NextResponse.json({ error: "That child profile does not belong to your account." }, { status: 403 });
      }
    } else {
      const childCount = await db.childProfile.count({ where: { parentId: user.id } });
      if (childCount > 0) {
        return NextResponse.json({ error: "Select which child this lesson is for." }, { status: 400 });
      }
    }

    const scheduledAt = new Date(`${date}T${time}:00+01:00`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return NextResponse.json({ error: "Choose a valid future date and time." }, { status: 400 });
    }

    const tutor = await db.tutorProfile.findFirst({
      where: {
        id,
        isPublished: true,
        applicationStatus: "APPROVED",
        verificationStatus: "VERIFIED",
      },
      include: { user: true, availability: true },
    });

    if (!tutor || !tutor.hourlyRate) {
      return NextResponse.json({ error: "Tutor is not available for booking." }, { status: 404 });
    }

    const dayOfWeek = scheduledAt.getDay();
    const selectedMinutes = scheduledAt.getHours() * 60 + scheduledAt.getMinutes();

    const matchingAvailability = tutor.availability.find((slot) => {
      if (!slot.isActive || slot.dayOfWeek !== dayOfWeek) return false;
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      return selectedMinutes >= start && selectedMinutes + 60 <= end;
    });

    if (!matchingAvailability) {
      return NextResponse.json(
        { error: "That time is outside the tutor's published availability." },
        { status: 400 },
      );
    }

    // A lesson is 60 minutes. Two bookings conflict whenever:
    // existing.start < requested.end AND existing.end > requested.start.
    const lessonEnd = new Date(scheduledAt.getTime() + 60 * 60 * 1000);

    const possibleConflicts = await db.booking.findMany({
      where: {
        tutorId: tutor.userId,
        scheduledAt: { lt: lessonEnd },
        status: { in: ["PENDING", "AWAITING_PAYMENT", "CONFIRMED", "COMPLETED"] },
      },
      select: {
        id: true,
        scheduledAt: true,
        durationMinutes: true,
      },
    });

    const conflictingBooking = possibleConflicts.find((booking) => {
      const existingEnd = new Date(
        booking.scheduledAt.getTime() + booking.durationMinutes * 60 * 1000,
      );

      return booking.scheduledAt < lessonEnd && existingEnd > scheduledAt;
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "That time overlaps another lesson request. Please choose another slot." },
        { status: 409 },
      );
    }

    const learnerProfile = await db.learnerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, displayName: user.name ?? "Learner" },
    });

    const booking = await db.booking.create({
      data: {
        learnerId: user.id,
        learnerProfileId: learnerProfile.id,
        childProfileId: childProfileIdValue,
        tutorId: tutor.userId,
        tutorProfileId: tutor.id,
        scheduledAt,
        durationMinutes: 60,
        priceAmount: tutor.hourlyRate,
        discountAmount: 0,
        totalAmount: tutor.hourlyRate,
        currency: tutor.currency,
        status: "PENDING",
        paymentStatus: "UNPAID",
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: `Your 60-minute lesson request with ${tutor.displayName ?? "your tutor"} has been created for ${scheduledAt.toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" })}. Payment will be available when this booking moves to checkout.`,
    });
  } catch (error) {
    console.error("Tutor booking POST error:", error);
    return NextResponse.json({ error: "Unable to create booking." }, { status: 500 });
  }
}
