const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const questions = [
  {
    questionText: "What does “Báwo ni?” mean in English?",
    pointsReward: 1,
    order: 1,
    options: [
      { optionText: "How are you?", isCorrect: true },
      { optionText: "What is your name?", isCorrect: false },
      { optionText: "Where are you going?", isCorrect: false },
      { optionText: "Good night", isCorrect: false },
    ],
  },
  {
    questionText: "Which Yoruba word means “thank you”?",
    pointsReward: 1,
    order: 2,
    options: [
      { optionText: "Ẹ káàrọ̀", isCorrect: false },
      { optionText: "Ẹ ṣé", isCorrect: true },
      { optionText: "Ó dàbọ̀", isCorrect: false },
      { optionText: "Bẹ́ẹ̀ ni", isCorrect: false },
    ],
  },
  {
    questionText: "What does “omi” mean?",
    pointsReward: 1,
    order: 3,
    options: [
      { optionText: "Food", isCorrect: false },
      { optionText: "House", isCorrect: false },
      { optionText: "Water", isCorrect: true },
      { optionText: "Child", isCorrect: false },
    ],
  },
  {
    questionText: "Which Yoruba greeting is commonly used in the morning?",
    pointsReward: 1,
    order: 4,
    options: [
      { optionText: "Ẹ káàrọ̀", isCorrect: true },
      { optionText: "Ẹ kúulé", isCorrect: false },
      { optionText: "Ẹ káalẹ́", isCorrect: false },
      { optionText: "Ó dàárọ̀", isCorrect: false },
    ],
  },
  {
    questionText: "What does “Bẹ́ẹ̀ ni” mean?",
    pointsReward: 1,
    order: 5,
    options: [
      { optionText: "No", isCorrect: false },
      { optionText: "Maybe", isCorrect: false },
      { optionText: "Please", isCorrect: false },
      { optionText: "Yes", isCorrect: true },
    ],
  },
  {
    questionText: "What does “Mo dúpẹ́” mean?",
    pointsReward: 1,
    order: 6,
    options: [
      { optionText: "I am hungry", isCorrect: false },
      { optionText: "I am grateful / I thank you", isCorrect: true },
      { optionText: "I am coming", isCorrect: false },
      { optionText: "I am learning", isCorrect: false },
    ],
  },
  {
    questionText: "Which word means “house” in Yoruba?",
    pointsReward: 1,
    order: 7,
    options: [
      { optionText: "Ọkọ", isCorrect: false },
      { optionText: "Ilé", isCorrect: true },
      { optionText: "Ọjà", isCorrect: false },
      { optionText: "Omi", isCorrect: false },
    ],
  },
  {
    questionText: "What does “Ó dàbọ̀” mean?",
    pointsReward: 1,
    order: 8,
    options: [
      { optionText: "Welcome", isCorrect: false },
      { optionText: "Good afternoon", isCorrect: false },
      { optionText: "Goodbye", isCorrect: true },
      { optionText: "Thank you", isCorrect: false },
    ],
  },
  {
    questionText: "What does “orúkọ” mean?",
    pointsReward: 1,
    order: 9,
    options: [
      { optionText: "Name", isCorrect: true },
      { optionText: "Friend", isCorrect: false },
      { optionText: "School", isCorrect: false },
      { optionText: "Market", isCorrect: false },
    ],
  },
  {
    questionText: "What does “Mo fẹ́ràn rẹ” mean?",
    pointsReward: 1,
    order: 10,
    options: [
      { optionText: "I know you", isCorrect: false },
      { optionText: "I miss you", isCorrect: false },
      { optionText: "I love you / I like you", isCorrect: true },
      { optionText: "I see you", isCorrect: false },
    ],
  },
];

async function main() {
  const challenge = await prisma.challenge.upsert({
    where: { slug: "welcome-yoruba-challenge" },
    update: {
      title: "Test Your Yoruba",
      description:
        "Answer 10 simple Yoruba questions and earn learning credit toward your first lesson.",
      type: "WELCOME",
      maxRewardAmount: 2000,
      currency: "NGN",
      isActive: true,
    },
    create: {
      title: "Test Your Yoruba",
      slug: "welcome-yoruba-challenge",
      description:
        "Answer 10 simple Yoruba questions and earn learning credit toward your first lesson.",
      type: "WELCOME",
      maxRewardAmount: 2000,
      currency: "NGN",
      isActive: true,
    },
  });

  const existingQuestions = await prisma.question.count({
    where: { challengeId: challenge.id },
  });

  if (existingQuestions === 0) {
    for (const question of questions) {
      await prisma.question.create({
        data: {
          challengeId: challenge.id,
          questionText: question.questionText,
          pointsReward: question.pointsReward,
          order: question.order,
          options: {
            create: question.options,
          },
        },
      });
    }
  }

  console.log(
    `Welcome Yoruba Challenge ready: ${challenge.id} (${existingQuestions || questions.length} questions)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
