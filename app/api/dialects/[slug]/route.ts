import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const publishableRights = ["ORIGINAL", "PUBLIC_DOMAIN", "LICENSED", "PERMISSION_GRANTED"];

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const dialect = await db.dialect.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        region: true,
        description: true,
        resources: {
          where: {
            resource: {
              is: {
                status: "PUBLISHED",
                consentRecorded: true,
                rightsStatus: { in: publishableRights },
              },
            },
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
          select: {
            isPrimary: true,
            note: true,
            resource: {
              select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                resourceType: true,
                difficulty: true,
                ageMin: true,
                ageMax: true,
              },
            },
          },
        },
      },
    });

    if (!dialect) {
      return NextResponse.json({ error: "Dialect not found." }, { status: 404 });
    }

    return NextResponse.json({ dialect });
  } catch (error) {
    console.error("Dialect detail error:", error);
    return NextResponse.json(
      { error: "Unable to load this dialect." },
      { status: 500 },
    );
  }
}
