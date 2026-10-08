import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateGuestSession } from "@/lib/guestSession";

type SubmittedAnswer = {
  questionId: string;
  selectedOptionId: string;
};

function calculateReward(score: number, totalQuestions: number) {
  if (totalQuestions === 0) return 0;

  const percentage = (score / totalQuestions) * 100;

  if (percentage >= 100) return 2000;
  if (percentage >= 90) return 1500;
  if (percentage >= 80) return 1000;

  return 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const challengeId = body?.challengeId as string | undefined;
    const answers = body?.answers as SubmittedAnswer[] | undefined;

    if (!challengeId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "challengeId and answers are required." },
        { status: 400 },
      );
    }

    if (answers.length === 0) {
      return NextResponse.json(
        { error: "Please answer the challenge questions." },
        { status: 400 },
      );
    }

    const guestSession = await getOrCreateGuestSession();

    if (!guestSession) {
      return NextResponse.json(
        { error: "Unable to create a challenge session." },
        { status: 500 },
      );
    }

    const challenge = await db.challenge.findFirst({
      where: {
        id: challengeId,
        slug: "welcome-yoruba-challenge",
        type: "WELCOME",
        isActive: true,
      },
      include: {
        questions: {
          where: { isActive: true },
          select: {
            id: true,
            options: {
              select: {
                id: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found or no longer active." },
        { status: 404 },
      );
    }

    if (answers.length !== challenge.questions.length) {
      return NextResponse.json(
        {
          error: "Please answer every question before submitting.",
          expected: challenge.questions.length,
          received: answers.length,
        },
        { status: 400 },
      );
    }

    const questionIds = new Set<string>();
    for (const answer of answers) {
      if (!answer?.questionId || !answer?.selectedOptionId) {
        return NextResponse.json(
          { error: "Every answer must include a question and selected option." },
          { status: 400 },
        );
      }

      if (questionIds.has(answer.questionId)) {
        return NextResponse.json(
          { error: "A question can only be answered once." },
          { status: 400 },
        );
      }

      questionIds.add(answer.questionId);
    }

    const questionMap = new Map(
      challenge.questions.map((question) => [question.id, question]),
    );

    let score = 0;

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        return NextResponse.json(
          { error: "One or more submitted questions are invalid." },
          { status: 400 },
        );
      }

      const selectedOption = question.options.find(
        (option) => option.id === answer.selectedOptionId,
      );

      if (!selectedOption) {
        return NextResponse.json(
          { error: "One or more selected answers are invalid." },
          { status: 400 },
        );
      }

      if (selectedOption.isCorrect) {
        score += 1;
      }
    }

    const totalQuestions = challenge.questions.length;
    const rewardAmount = Math.min(
      calculateReward(score, totalQuestions),
      challenge.maxRewardAmount,
    );

    const attempt = await db.$transaction(async (tx) => {
      const existingAttempt = await tx.challengeAttempt.findUnique({
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
        return {
          duplicate: true,
          attempt: existingAttempt,
        };
      }

      const createdAttempt = await tx.challengeAttempt.create({
        data: {
          challengeId: challenge.id,
          guestSessionId: guestSession.id,
          score,
          totalQuestions,
          rewardAmount,
          status: "COMPLETED",
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

      await tx.guestSession.update({
        where: { id: guestSession.id },
        data: {
          pendingPoints: rewardAmount,
        },
      });

      return {
        duplicate: false,
        attempt: createdAttempt,
      };
    });

    if (attempt.duplicate) {
      return NextResponse.json(
        {
          error: "You have already completed this challenge.",
          code: "ALREADY_COMPLETED",
          attempt: attempt.attempt,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      score: attempt.attempt.score,
      totalQuestions: attempt.attempt.totalQuestions,
      rewardAmount: attempt.attempt.rewardAmount,
      currency: challenge.currency,
      rewardType: "LEARNING_CREDIT",
      message:
        rewardAmount > 0
          ? `You earned ₦${rewardAmount.toLocaleString()} in learning credit.`
          : "You completed the challenge. Keep learning and try again when you reach a new level.",
      claimRequired: true,
      attemptId: attempt.attempt.id,
    });
  } catch (error) {
    console.error("Welcome Challenge Submission Error:", error);

    return NextResponse.json(
      { error: "Unable to submit the Yoruba Challenge." },
      { status: 500 },
    );
  }
}
