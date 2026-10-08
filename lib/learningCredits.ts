import { db } from "@/lib/db";
import { getGuestSessionToken } from "@/lib/guestSession";

export async function claimGuestLearningCredit(userId: string) {
  const guestToken = await getGuestSessionToken();

  if (!guestToken) {
    return { claimed: false, amount: 0 };
  }

  return db.$transaction(async (tx) => {
    const guestSession = await tx.guestSession.findUnique({
      where: { sessionToken: guestToken },
      include: {
        challengeAttempts: {
          where: { rewardAmount: { gt: 0 } },
          include: { learningCredit: true },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!guestSession || guestSession.isClaimed || guestSession.userId) {
      return { claimed: false, amount: 0 };
    }

    const attempt = guestSession.challengeAttempts[0];

    if (!attempt || attempt.learningCredit) {
      return { claimed: false, amount: 0 };
    }

    await tx.learningCredit.create({
      data: {
        userId,
        amount: attempt.rewardAmount,
        currency: "NGN",
        source: "WELCOME_CHALLENGE",
        attemptId: attempt.id,
        status: "AVAILABLE",
      },
    });

    await tx.challengeAttempt.update({
      where: { id: attempt.id },
      data: { userId },
    });

    await tx.guestSession.update({
      where: { id: guestSession.id },
      data: {
        userId,
        isClaimed: true,
        pendingPoints: 0,
      },
    });

    return { claimed: true, amount: attempt.rewardAmount };
  });
}
