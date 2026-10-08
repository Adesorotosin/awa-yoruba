import { NextResponse } from "next/server";
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

    return NextResponse.json({ tutor });
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
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const date = String(body.date ?? "").trim();
    const time = String(body.time ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Name, email, date and time are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
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

    const lessonEnd = new Date(scheduledAt.getTime() + 60 * 60 * 1000);

    const conflictingBooking = await db.booking.findFirst({
      where: {
        tutorId: tutor.userId,
        scheduledAt: { lt: lessonEnd },
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "That time has already been requested. Please choose another slot." },
        { status: 409 },
      );
    }

    const user = await db.user.upsert({
      where: { email },
      update: { name },
      create: { name, email, role: "LEARNER" },
    });

    if (user.role === "TUTOR") {
      return NextResponse.json(
        { error: "A tutor account cannot create a learner booking with this email." },
        { status: 400 },
      );
    }

    const learnerProfile = await db.learnerProfile.upsert({
      where: { userId: user.id },
      update: { displayName: name },
      create: { userId: user.id, displayName: name },
    });

    const booking = await db.booking.create({
      data: {
        learnerId: user.id,
        learnerProfileId: learnerProfile.id,
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
