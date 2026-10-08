import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET(request: Request) {
  try {
    const tutorId = new URL(request.url).searchParams.get("tutorId")?.trim();

    if (!tutorId) {
      return NextResponse.json({ error: "Tutor profile ID is required." }, { status: 400 });
    }

    const tutor = await db.tutorProfile.findUnique({
      where: { id: tutorId },
      include: { user: true },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: tutor.id,
        userId: tutor.userId,
        displayName: tutor.displayName,
        photoUrl: tutor.photoUrl,
        bio: tutor.bio,
        qualifications: tutor.qualifications,
        experienceYears: tutor.experienceYears,
        languages: tutor.languages,
        specialties: tutor.specialties,
        hourlyRate: tutor.hourlyRate,
        phone: tutor.user.phone,
        email: tutor.user.email,
      },
    });
  } catch (error) {
    console.error("Tutor profile GET error:", error);
    return NextResponse.json({ error: "Unable to load tutor profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tutorId = String(body.tutorId ?? "").trim();

    if (!tutorId) {
      return NextResponse.json({ error: "Tutor profile ID is required." }, { status: 400 });
    }

    const tutor = await db.tutorProfile.findUnique({
      where: { id: tutorId },
      select: { id: true, userId: true },
    });

    if (!tutor) {
      return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    }

    const displayName = clean(body.displayName);
    const bio = clean(body.bio);
    const qualifications = clean(body.qualifications);
    const languages = clean(body.languages);
    const specialties = clean(body.specialties);
    const photoUrl = clean(body.photoUrl);
    const phone = clean(body.phone);

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    }

    if (displayName.length > 100 || (bio && bio.length > 1200) || (qualifications && qualifications.length > 1000)) {
      return NextResponse.json({ error: "One or more profile fields are too long." }, { status: 400 });
    }

    const experienceYears =
      body.experienceYears === "" || body.experienceYears == null
        ? null
        : Number(body.experienceYears);

    const hourlyRate =
      body.hourlyRate === "" || body.hourlyRate == null
        ? null
        : Number(body.hourlyRate);

    if (experienceYears !== null && (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 80)) {
      return NextResponse.json({ error: "Experience must be a whole number between 0 and 80." }, { status: 400 });
    }

    if (hourlyRate !== null && (!Number.isInteger(hourlyRate) || hourlyRate < 0 || hourlyRate > 1000000)) {
      return NextResponse.json({ error: "Hourly rate must be a valid NGN amount." }, { status: 400 });
    }

    if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
      return NextResponse.json({ error: "Profile photo must be a valid image URL starting with http:// or https://." }, { status: 400 });
    }

    const [profile] = await db.$transaction([
      db.tutorProfile.update({
        where: { id: tutorId },
        data: {
          displayName,
          photoUrl,
          bio,
          qualifications,
          experienceYears,
          languages,
          specialties,
          hourlyRate,
        },
      }),
      db.user.update({
        where: { id: tutor.userId },
        data: {
          name: displayName,
          phone,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      profile,
      message: "Tutor profile updated successfully.",
    });
  } catch (error) {
    console.error("Tutor profile PATCH error:", error);
    return NextResponse.json({ error: "Unable to update tutor profile." }, { status: 500 });
  }
}
