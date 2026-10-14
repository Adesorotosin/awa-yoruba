import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const dialects = await db.dialect.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        region: true,
        description: true,
        _count: {
          select: {
            resources: {
              where: {
                dialect: { is: { status: "PUBLISHED" } },
                resource: {
                  is: {
                    status: "PUBLISHED",
                    consentRecorded: true,
                    rightsStatus: {
                      in: ["ORIGINAL", "PUBLIC_DOMAIN", "LICENSED", "PERMISSION_GRANTED"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ dialects });
  } catch (error) {
    console.error("Dialect catalogue error:", error);
    return NextResponse.json(
      { error: "Unable to load the dialect catalogue." },
      { status: 500 },
    );
  }
}
