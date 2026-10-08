import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAuthorized(request: Request) {
  const configuredKey = process.env.ADMIN_KEY;
  const providedKey = request.headers.get("x-admin-key");

  return Boolean(configuredKey && providedKey && providedKey === configuredKey);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await db.tutorProfile.findMany({
    where: {
      applicationStatus: "PENDING",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ applications });
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tutorProfileId = String(body.tutorProfileId ?? "");
    const action = String(body.action ?? "");

    if (!tutorProfileId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid tutor application action." },
        { status: 400 },
      );
    }

    const profile = await db.tutorProfile.findUnique({
      where: { id: tutorProfileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Tutor application not found." },
        { status: 404 },
      );
    }

    const approved = action === "approve";

    const updatedProfile = await db.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        applicationStatus: approved ? "APPROVED" : "REJECTED",
        verificationStatus: approved ? "VERIFIED" : "REJECTED",
        isPublished: approved,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedProfile,
    });
  } catch (error) {
    console.error("Admin tutor action error:", error);
    return NextResponse.json(
      { error: "Unable to update tutor application." },
      { status: 500 },
    );
  }
}
