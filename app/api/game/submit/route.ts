// src/app/api/game/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateGuestSession } from "@/lib/guestSession";

export async function POST(req: Request) {
  try {
    const { questionId, selectedOptionId } = await req.json();

    if (!questionId || !selectedOptionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch Guest Session
    const guestSession = await getOrCreateGuestSession();

    // 2. Fetch Option to check correctness
    const option = await db.questionOption.findUnique({
      where: { id: selectedOptionId },
      include: { question: true },
    });

    if (!option || option.questionId !== questionId) {
      return NextResponse.json({ error: "Invalid question or option" }, { status: 400 });
    }

    const isCorrect = option.isCorrect;
    const pointsAwarded = isCorrect ? option.question.pointsReward : 0;

    // 3. Update Pending Points in Guest Session if correct
    if (isCorrect) {
      await db.guestSession.update({
        where: { id: guestSession.id },
        data: {
          pendingPoints: { increment: pointsAwarded },
        },
      });
    }

    return NextResponse.json({
      isCorrect,
      pointsEarned: pointsAwarded,
      newTotalPendingPoints: guestSession.pendingPoints + pointsAwarded,
    });
  } catch (error) {
    console.error("Game Submission Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}