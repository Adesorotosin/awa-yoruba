import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateGuestSession } from "@/lib/guestSession";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const challenge = await db.challenge.findFirst({
      where: {
        slug: "welcome-yoruba-challenge",
        type: "WELCOME",
        isActive: true,
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            questionText: true,
            audioUrl: true,
            order: true,
            options: {
              select: {
                id: true,
                optionText: true,
              },
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Welcome challenge is not available." },
        { status: 404 },
      );
    }

    const guestSession = await getOrCreateGuestSession();

    if (!guestSession) {
      return NextResponse.json(
        { error: "Unable to create a challenge session." },
        { status: 500 },
      );
    }

    const existingAttempt = await db.challengeAttempt.findUnique({
      where: {
        challengeId_guestSessionId: {
          challengeId: challenge.id,
          guestSessionId: guestSession.id,
        },
      },
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        rewardAmount: true,
        status: true,
        completedAt: true,
      },
    });

    if (existingAttempt) {
      return NextResponse.json({
        available: false,
        reason: "ALREADY_COMPLETED",
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          maxRewardAmount: challenge.maxRewardAmount,
          currency: challenge.currency,
          questionCount: challenge.questions.length,
        },
        attempt: existingAttempt,
      });
    }

    return NextResponse.json({
      available: true,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        maxRewardAmount: challenge.maxRewardAmount,
        currency: challenge.currency,
        questions: challenge.questions,
      },
    });
  } catch (error) {
    console.error("Welcome Challenge GET Error:", error);

    return NextResponse.json(
      { error: "Unable to load the Yoruba Challenge." },
      { status: 500 },
    );
  }
}
