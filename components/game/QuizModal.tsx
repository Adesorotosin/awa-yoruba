"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  questionText: string;
  audioUrl?: string | null;
  pointsReward: number;
  options: Option[];
}

interface QuizModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onAnswerSubmit: (questionId: string, selectedOptionId: string) => Promise<{ isCorrect: boolean; pointsEarned: number }>;
}

export default function QuizModal({ question, isOpen, onClose, onAnswerSubmit }: QuizModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null);

  if (!isOpen || !question) return null;

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    const res = await onAnswerSubmit(question.id, selectedOption);
    setResult(res);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    setResult(null);
    setSelectedOption(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#0B3524] border border-[#D9A74A]/50 rounded-3xl p-6 max-w-md w-full text-white text-center shadow-2xl relative"
        >
          {!result ? (
            <>
              <span className="text-xs font-bold text-[#D9A74A] uppercase tracking-widest bg-[#D9A74A]/10 px-3 py-1 rounded-full border border-[#D9A74A]/20">
                🎯 Quick Challenge (+{question.pointsReward} Pts)
              </span>

              <h3 className="text-xl font-bold text-white mt-4 mb-6">
                {question.questionText}
              </h3>

              <div className="space-y-3 mb-6">
                {question.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full p-3.5 rounded-xl text-left text-sm font-medium border transition-all cursor-pointer ${
                      selectedOption === opt.id
                        ? "bg-[#D9A74A] text-[#114B33] border-[#D9A74A] font-bold"
                        : "bg-[#114B33] text-white border-[#23684B] hover:border-[#D9A74A]/50"
                    }`}
                  >
                    {opt.optionText}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
                className="w-full bg-[#D9A74A] hover:bg-[#c49339] disabled:opacity-50 text-[#114B33] font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
              >
                {isSubmitting ? "Checking..." : "Submit Answer"}
              </button>
            </>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-6xl">{result.isCorrect ? "🎉" : "😅"}</div>
              <h3 className="text-2xl font-bold">
                {result.isCorrect ? "Ẹ kú oríire! (Correct!)" : "Opps, Not Quite!"}
              </h3>
              <p className="text-sm text-[#A3C2B3]">
                {result.isCorrect
                  ? `You just added ${result.pointsEarned} points to your pending balance!`
                  : "Good try! Keep practicing to earn more points on your next spin."}
              </p>

              <button
                onClick={handleNext}
                className="w-full bg-[#D9A74A] hover:bg-[#c49339] text-[#114B33] font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer mt-4"
              >
                Continue Playing 🚀
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}