import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const publishableRights = ["ORIGINAL", "PUBLIC_DOMAIN", "LICENSED", "PERMISSION_GRANTED"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.trim().toUpperCase();

    const resources = await db.culturalResource.findMany({
      where: {
        status: "PUBLISHED",
        consentRecorded: true,
        rightsStatus: { in: publishableRights },
        ...(type && type !== "ALL" ? { resourceType: type } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        resourceType: true,
        difficulty: true,
        ageMin: true,
        ageMax: true,
        audioUrl: true,
        imageUrl: true,
        dialects: {
          where: { dialect: { is: { status: "PUBLISHED" } } },
          select: {
            isPrimary: true,
            dialect: { select: { name: true, slug: true, region: true } },
          },
        },
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Cultural library error:", error);
    return NextResponse.json(
      { error: "Unable to load the cultural library." },
      { status: 500 },
    );
  }
}
