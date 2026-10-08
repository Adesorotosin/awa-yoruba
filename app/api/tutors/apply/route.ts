import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const experienceYears = Number(formData.get("experienceYears"));
    const specialties = String(formData.get("specialties") ?? "").trim();
    const languages = String(formData.get("languages") ?? "").trim();
    const qualifications = String(formData.get("qualifications") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const hourlyRate = Number(formData.get("hourlyRate"));

    if (
      !name ||
      !email ||
      !phone ||
      password.length < 8 ||
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      !specialties ||
      !languages ||
      !qualifications ||
      !bio ||
      !Number.isInteger(hourlyRate) ||
      hourlyRate < 0
    ) {
      return NextResponse.redirect(new URL("/tutor/apply?error=invalid", request.url));
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });

    if (existingUser?.tutorProfile) {
      return NextResponse.redirect(new URL("/tutor/apply?error=already-applied", request.url));
    }

    if (existingUser?.passwordHash) {
      return NextResponse.redirect(new URL("/tutor/apply?error=account-exists", request.url));
    }

    const user = existingUser
      ? await db.user.update({
          where: { id: existingUser.id },
          data: { name, phone, role: "TUTOR" },
        })
      : await db.user.create({
          data: {
            name,
            email,
            phone,
            role: "TUTOR",
          },
        });

    await setPassword(user.id, password);

    await db.tutorProfile.create({
      data: {
        userId: user.id,
        displayName: name,
        bio,
        qualifications,
        experienceYears,
        languages,
        specialties,
        hourlyRate,
        currency: "NGN",
        applicationStatus: "PENDING",
        verificationStatus: "PENDING",
        isPublished: false,
      },
    });

    return NextResponse.redirect(new URL("/tutor/apply?success=1", request.url));
  } catch (error) {
    console.error("Tutor application error:", error);
    return NextResponse.redirect(new URL("/tutor/apply?error=server", request.url));
  }
}
