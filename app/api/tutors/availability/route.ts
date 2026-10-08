import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getTutorId(request: Request, body?: Record<string, unknown>) {
  const url = new URL(request.url);
  return String(body?.tutorId ?? url.searchParams.get("tutorId") ?? "").trim();
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidDay(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 6;
}

async function getTutorProfile(tutorId: string) {
  if (!tutorId) return null;
  return db.tutorProfile.findFirst({
    where: { id: tutorId, isPublished: true, applicationStatus: "APPROVED", verificationStatus: "VERIFIED" },
    select: { id: true, displayName: true, userId: true, currency: true },
  });
}

export async function GET(request: Request) {
  try {
    const tutorId = getTutorId(request);
    const tutor = await getTutorProfile(tutorId);
    if (!tutor) return NextResponse.json({ error: "Approved tutor not found." }, { status: 404 });

    const availability = await db.tutorAvailability.findMany({
      where: { tutorProfileId: tutor.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json({ tutor, availability });
  } catch (error) {
    console.error("Tutor availability GET error:", error);
    return NextResponse.json({ error: "Unable to load tutor availability." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireTutor();
    const body = (await request.json()) as Record<string, unknown>;
    const tutorId = getTutorId(request, body);
    if (tutorId !== user.tutorProfile!.id) return NextResponse.json({ error: "You can only edit your own availability." }, { status: 403 });

    const dayOfWeek = Number(body.dayOfWeek);
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim();

    if (!isValidDay(dayOfWeek) || !isValidTime(startTime) || !isValidTime(endTime)) {
      return NextResponse.json({ error: "Tutor, day, start time and end time are required." }, { status: 400 });
    }
    if (startTime >= endTime) return NextResponse.json({ error: "End time must be later than start time." }, { status: 400 });

    const tutor = await getTutorProfile(tutorId);
    if (!tutor) return NextResponse.json({ error: "Approved tutor not found." }, { status: 404 });

    const overlapping = await db.tutorAvailability.findFirst({
      where: { tutorProfileId: tutor.id, dayOfWeek, isActive: true, startTime: { lt: endTime }, endTime: { gt: startTime } },
    });
    if (overlapping) return NextResponse.json({ error: "This time overlaps an existing availability period." }, { status: 409 });

    const availability = await db.tutorAvailability.create({
      data: { tutorId: tutor.userId, tutorProfileId: tutor.id, dayOfWeek, startTime, endTime, timezone: "Africa/Lagos", isActive: true },
    });
    return NextResponse.json({ success: true, availability, message: DAY_NAMES[dayOfWeek] + " availability added." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    console.error("Tutor availability POST error:", error);
    return NextResponse.json({ error: "Unable to add availability." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireTutor();
    const body = (await request.json()) as Record<string, unknown>;
    const tutorId = getTutorId(request, body);
    if (tutorId !== user.tutorProfile!.id) return NextResponse.json({ error: "You can only edit your own availability." }, { status: 403 });

    const availabilityId = String(body.availabilityId ?? "").trim();
    const dayOfWeek = Number(body.dayOfWeek);
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim();

    if (!availabilityId || !isValidDay(dayOfWeek) || !isValidTime(startTime) || !isValidTime(endTime)) {
      return NextResponse.json({ error: "Invalid availability details." }, { status: 400 });
    }
    if (startTime >= endTime) return NextResponse.json({ error: "End time must be later than start time." }, { status: 400 });

    const tutor = await getTutorProfile(tutorId);
    if (!tutor) return NextResponse.json({ error: "Approved tutor not found." }, { status: 404 });

    const existing = await db.tutorAvailability.findFirst({ where: { id: availabilityId, tutorProfileId: tutor.id } });
    if (!existing) return NextResponse.json({ error: "Availability period not found." }, { status: 404 });

    const overlapping = await db.tutorAvailability.findFirst({
      where: { tutorProfileId: tutor.id, id: { not: availabilityId }, dayOfWeek, isActive: true, startTime: { lt: endTime }, endTime: { gt: startTime } },
    });
    if (overlapping) return NextResponse.json({ error: "This time overlaps an existing availability period." }, { status: 409 });

    const availability = await db.tutorAvailability.update({
      where: { id: availabilityId },
      data: { dayOfWeek, startTime, endTime, isActive: true },
    });
    return NextResponse.json({ success: true, availability, message: "Availability updated." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    console.error("Tutor availability PATCH error:", error);
    return NextResponse.json({ error: "Unable to update availability." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireTutor();
    const body = (await request.json()) as Record<string, unknown>;
    const tutorId = getTutorId(request, body);
    if (tutorId !== user.tutorProfile!.id) return NextResponse.json({ error: "You can only edit your own availability." }, { status: 403 });

    const availabilityId = String(body.availabilityId ?? "").trim();
    if (!availabilityId) return NextResponse.json({ error: "Availability is required." }, { status: 400 });

    const existing = await db.tutorAvailability.findFirst({ where: { id: availabilityId, tutorProfileId: tutorId } });
    if (!existing) return NextResponse.json({ error: "Availability period not found." }, { status: 404 });

    await db.tutorAvailability.delete({ where: { id: availabilityId } });
    return NextResponse.json({ success: true, message: "Availability removed." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    console.error("Tutor availability DELETE error:", error);
    return NextResponse.json({ error: "Unable to remove availability." }, { status: 500 });
  }
}
