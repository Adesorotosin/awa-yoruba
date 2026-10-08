import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

    const tutors = await db.tutorProfile.findMany({
      where: {
        isPublished: true,
        applicationStatus: "APPROVED",
        verificationStatus: "VERIFIED",
      },
      include: { user: true },
      orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
    });

    const filtered = search
      ? tutors.filter((tutor) => {
          const haystack = [
            tutor.displayName,
            tutor.bio,
            tutor.languages,
            tutor.specialties,
            tutor.qualifications,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(search);
        })
      : tutors;

    return NextResponse.json({ tutors: filtered });
  } catch (error) {
    console.error("Tutor marketplace error:", error);
    return NextResponse.json(
      { error: "Unable to load tutors." },
      { status: 500 },
    );
  }
}
