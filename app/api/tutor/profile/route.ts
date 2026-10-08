import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET() {
  try {
    const user = await requireTutor();
    const tutor = user.tutorProfile!;

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
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    return NextResponse.json({ error: "Unable to load tutor profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireTutor();
    const tutor = user.tutorProfile!;
    const body = (await request.json()) as Record<string, unknown>;

    const displayName = clean(body.displayName);
    const bio = clean(body.bio);
    const qualifications = clean(body.qualifications);
    const languages = clean(body.languages);
    const specialties = clean(body.specialties);
    const photoUrl = clean(body.photoUrl);
    const phone = clean(body.phone);

    if (!displayName) return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    if (displayName.length > 100 || (bio && bio.length > 1200) || (qualifications && qualifications.length > 1000)) {
      return NextResponse.json({ error: "One or more profile fields are too long." }, { status: 400 });
    }

    const experienceYears = body.experienceYears === "" || body.experienceYears == null ? null : Number(body.experienceYears);
    const hourlyRate = body.hourlyRate === "" || body.hourlyRate == null ? null : Number(body.hourlyRate);

    if (experienceYears !== null && (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 80)) {
      return NextResponse.json({ error: "Experience must be a whole number between 0 and 80." }, { status: 400 });
    }
    if (hourlyRate !== null && (!Number.isInteger(hourlyRate) || hourlyRate < 0 || hourlyRate > 1000000)) {
      return NextResponse.json({ error: "Hourly rate must be a valid NGN amount." }, { status: 400 });
    }
    if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
      return NextResponse.json({ error: "Profile photo must be a valid image URL." }, { status: 400 });
    }

    const [profile] = await db.$transaction([
      db.tutorProfile.update({
        where: { id: tutor.id },
        data: { displayName, photoUrl, bio, qualifications, experienceYears, languages, specialties, hourlyRate },
      }),
      db.user.update({ where: { id: user.id }, data: { name: displayName, phone } }),
    ]);

    return NextResponse.json({ success: true, profile, message: "Tutor profile updated successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") return NextResponse.json({ error: "Please log in as a tutor." }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ error: "Tutor access is required." }, { status: 403 });
    console.error("Tutor profile PATCH error:", error);
    return NextResponse.json({ error: "Unable to update tutor profile." }, { status: 500 });
  }
}
