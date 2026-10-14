import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const publishableRights = ["ORIGINAL", "PUBLIC_DOMAIN", "LICENSED", "PERMISSION_GRANTED"];

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const resource = await db.culturalResource.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        consentRecorded: true,
        rightsStatus: { in: publishableRights },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        resourceType: true,
        originalText: true,
        translation: true,
        transcript: true,
        audioUrl: true,
        imageUrl: true,
        ageMin: true,
        ageMax: true,
        difficulty: true,
        contributorName: true,
        sourceName: true,
        sourceUrl: true,
        reviewedBy: true,
        reviewedAt: true,
        dialects: {
          where: { dialect: { status: "PUBLISHED" } },
          select: {
            isPrimary: true,
            note: true,
            dialect: { select: { name: true, slug: true, region: true } },
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Cultural resource detail error:", error);
    return NextResponse.json(
      { error: "Unable to load this resource." },
      { status: 500 },
    );
  }
}
