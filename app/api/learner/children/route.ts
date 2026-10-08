import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== "LEARNER") return NextResponse.json({ error: "Parent access required." }, { status: 403 });

    const children = await db.childProfile.findMany({
      where: { parentId: user.id },
      include: { currentLevel: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ children });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }
    console.error("Children GET error:", error);
    return NextResponse.json({ error: "Unable to load children." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "LEARNER") return NextResponse.json({ error: "Parent access required." }, { status: 403 });

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const ageValue = body.age;
    const age = ageValue === undefined || ageValue === null || ageValue === "" ? null : Number(ageValue);

    if (!name) return NextResponse.json({ error: "Child's name is required." }, { status: 400 });
    if (age !== null && (!Number.isInteger(age) || age < 2 || age > 18)) {
      return NextResponse.json({ error: "Age must be a whole number between 2 and 18." }, { status: 400 });
    }

    const learnerProfile = await db.learnerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, displayName: user.name ?? "Parent" },
    });

    const child = await db.childProfile.create({
      data: {
        parentId: user.id,
        learnerProfileId: learnerProfile.id,
        name,
        age,
      },
      include: { currentLevel: true },
    });

    return NextResponse.json({ success: true, child }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }
    console.error("Children POST error:", error);
    return NextResponse.json({ error: "Unable to add child." }, { status: 500 });
  }
}
