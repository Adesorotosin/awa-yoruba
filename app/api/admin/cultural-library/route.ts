import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const publishableRights = ["ORIGINAL", "PUBLIC_DOMAIN", "LICENSED", "PERMISSION_GRANTED"];
const resourceTypes = ["STORY", "PROVERB", "SONG", "VOCABULARY", "CONVERSATION", "AUDIO"];

function isAuthorized(request: Request) {
  const configuredKey = process.env.ADMIN_KEY;
  const providedKey = request.headers.get("x-admin-key");
  return Boolean(configuredKey && providedKey && providedKey === configuredKey);
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validOptionalUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const [dialects, resources] = await Promise.all([
      db.dialect.findMany({ orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
      db.culturalResource.findMany({
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
          dialects: { include: { dialect: { select: { id: true, name: true, slug: true } } } },
        },
      }),
    ]);
    return NextResponse.json({ dialects, resources });
  } catch (error) {
    console.error("Admin cultural library load error:", error);
    return NextResponse.json({ error: "Unable to load cultural library records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const kind = textValue(body.kind);
    const slug = textValue(body.slug).toLowerCase();

    if (!validSlug(slug)) {
      return NextResponse.json({ error: "Use a lowercase URL slug with letters, numbers, and single hyphens." }, { status: 400 });
    }

    if (kind === "dialect") {
      const name = textValue(body.name);
      const summary = textValue(body.summary);
      if (!name || !summary) {
        return NextResponse.json({ error: "Dialect name and summary are required." }, { status: 400 });
      }

      const dialect = await db.dialect.create({
        data: {
          name,
          slug,
          summary,
          region: textValue(body.region) || null,
          description: textValue(body.description) || null,
          status: "DRAFT",
        },
      });
      return NextResponse.json({ dialect }, { status: 201 });
    }

    if (kind === "resource") {
      const title = textValue(body.title);
      const summary = textValue(body.summary);
      const resourceType = textValue(body.resourceType).toUpperCase();
      const rightsStatus = textValue(body.rightsStatus).toUpperCase();
      const dialectIds = Array.isArray(body.dialectIds)
        ? [...new Set(body.dialectIds.map((value) => textValue(value)).filter(Boolean))]
        : [];
      const ageMin = body.ageMin === "" || body.ageMin == null ? null : Number(body.ageMin);
      const ageMax = body.ageMax === "" || body.ageMax == null ? null : Number(body.ageMax);

      if (!title || !summary) {
        return NextResponse.json({ error: "Resource title and summary are required." }, { status: 400 });
      }
      if (!resourceTypes.includes(resourceType)) {
        return NextResponse.json({ error: "Choose a supported resource type." }, { status: 400 });
      }
      if (ageMin !== null && (!Number.isInteger(ageMin) || ageMin < 0 || ageMin > 18)) {
        return NextResponse.json({ error: "Minimum age must be a whole number between 0 and 18." }, { status: 400 });
      }
      if (ageMax !== null && (!Number.isInteger(ageMax) || ageMax < 0 || ageMax > 18)) {
        return NextResponse.json({ error: "Maximum age must be a whole number between 0 and 18." }, { status: 400 });
      }
      if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
        return NextResponse.json({ error: "Minimum age cannot exceed maximum age." }, { status: 400 });
      }
      if (!validOptionalUrl(textValue(body.audioUrl)) || !validOptionalUrl(textValue(body.imageUrl)) || !validOptionalUrl(textValue(body.sourceUrl))) {
        return NextResponse.json({ error: "Audio, image, and source links must be valid HTTP or HTTPS URLs." }, { status: 400 });
      }
      if (rightsStatus && ![...publishableRights, "UNCONFIRMED"].includes(rightsStatus)) {
        return NextResponse.json({ error: "Choose a supported rights status." }, { status: 400 });
      }

      if (dialectIds.length) {
        const matchingDialects = await db.dialect.count({ where: { id: { in: dialectIds } } });
        if (matchingDialects !== dialectIds.length) {
          return NextResponse.json({ error: "One or more selected dialects no longer exist." }, { status: 400 });
        }
      }

      const resource = await db.culturalResource.create({
        data: {
          title,
          slug,
          summary,
          resourceType,
          originalText: textValue(body.originalText) || null,
          translation: textValue(body.translation) || null,
          transcript: textValue(body.transcript) || null,
          audioUrl: textValue(body.audioUrl) || null,
          imageUrl: textValue(body.imageUrl) || null,
          ageMin,
          ageMax,
          difficulty: textValue(body.difficulty).toUpperCase() || "BEGINNER",
          status: "DRAFT",
          contributorName: textValue(body.contributorName) || null,
          sourceName: textValue(body.sourceName) || null,
          sourceUrl: textValue(body.sourceUrl) || null,
          rightsStatus: rightsStatus || "UNCONFIRMED",
          consentRecorded: body.consentRecorded === true,
          dialects: {
            create: dialectIds.map((dialectId, index) => ({
              dialect: { connect: { id: dialectId } },
              isPrimary: index === 0,
            })),
          },
        },
        include: { dialects: { include: { dialect: { select: { id: true, name: true, slug: true } } } } },
      });
      return NextResponse.json({ resource }, { status: 201 });
    }

    return NextResponse.json({ error: "Choose either dialect or resource." }, { status: 400 });
  } catch (error) {
    console.error("Admin cultural library create error:", error);
    return NextResponse.json({ error: "Unable to create this record. Check that its slug is unique." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const kind = textValue(body.kind);
    const id = textValue(body.id);
    const status = textValue(body.status).toUpperCase();
    const reviewedBy = textValue(body.reviewedBy);

    if (!id || !["DRAFT", "PUBLISHED"].includes(status)) {
      return NextResponse.json({ error: "A record ID and valid publication status are required." }, { status: 400 });
    }

    if (status === "PUBLISHED" && !reviewedBy) {
      return NextResponse.json({ error: "Enter the name of the language or cultural reviewer before publishing." }, { status: 400 });
    }

    if (kind === "dialect") {
      const existing = await db.dialect.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Dialect not found." }, { status: 404 });
      const dialect = await db.dialect.update({
        where: { id },
        data: {
          status,
          reviewedBy: status === "PUBLISHED" ? reviewedBy : existing.reviewedBy,
          reviewedAt: status === "PUBLISHED" ? new Date() : existing.reviewedAt,
        },
      });
      return NextResponse.json({ dialect });
    }

    if (kind === "resource") {
      const existing = await db.culturalResource.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

      if (status === "PUBLISHED") {
        if (!existing.consentRecorded) {
          return NextResponse.json({ error: "Record contributor permission/consent before publishing this resource." }, { status: 400 });
        }
        if (!publishableRights.includes(existing.rightsStatus)) {
          return NextResponse.json({ error: "Confirm that this resource is original, public domain, licensed, or permission-granted before publishing." }, { status: 400 });
        }
      }

      const resource = await db.culturalResource.update({
        where: { id },
        data: {
          status,
          reviewedBy: status === "PUBLISHED" ? reviewedBy : existing.reviewedBy,
          reviewedAt: status === "PUBLISHED" ? new Date() : existing.reviewedAt,
        },
      });
      return NextResponse.json({ resource });
    }

    return NextResponse.json({ error: "Choose either dialect or resource." }, { status: 400 });
  } catch (error) {
    console.error("Admin cultural library update error:", error);
    return NextResponse.json({ error: "Unable to update this record." }, { status: 500 });
  }
}
