"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

interface Prize {
  label: string;
  color: string;
  textColor: string;
  points: number;
}

const PRIZES: Prize[] = [
  { label: "1 Free Trial Class", color: "#f59e0b", textColor: "#ffffff", points: 50 },
  { label: "10% Off Tuition", color: "#10b981", textColor: "#ffffff", points: 30 },
  { label: "Yoruba Storybook PDF", color: "#3b82f6", textColor: "#ffffff", points: 20 },
  { label: "50 Bonus Points", color: "#8b5cf6", textColor: "#ffffff", points: 50 },
  { label: "Free Vocab Flashcards", color: "#ec4899", textColor: "#ffffff", points: 15 },
  { label: "1-on-1 Tutor Review", color: "#f97316", textColor: "#ffffff", points: 40 },
];

export function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  const numSlices = PRIZES.length;
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick a random prize
    const randomIndex = Math.floor(Math.random() * numSlices);
    const selectedPrize = PRIZES[randomIndex];

    // Calculate rotation to land pointer (top center, 270deg) on winning slice
    const extraSpins = 5 * 360; // 5 full revolutions for visual suspense
    const targetSliceCenter = randomIndex * sliceAngle + sliceAngle / 2;
    const finalRotation = rotation + extraSpins + (360 - (rotation % 360)) + (360 - targetSliceCenter);

    setRotation(finalRotation);

    // Wait for wheel animation duration (4s) before declaring winner and dispatching event
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);

      // Save reward state in local storage
      localStorage.setItem("yoruba_trial_reward", selectedPrize.label);
      localStorage.setItem("yoruba_earned_points", selectedPrize.points.toString());

      // Dispatch custom event to trigger TrialRegistrationModal
      const rewardEvent = new CustomEvent("yoruba-reward-claimed", {
        detail: {
          reward: selectedPrize.label,
          points: selectedPrize.points,
        },
      });

      window.dispatchEvent(rewardEvent);
    }, 4000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl border border-amber-200 shadow-xl max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/60 text-amber-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Spin to Win
        </span>
        <h2 className="text-2xl font-bold text-slate-900">Ẹ yí àyàbá wò!</h2>
        <p className="text-xs text-slate-600 mt-1">
          Spin the wheel to unlock free trial perks and bonus rewards for your child.
        </p>
      </div>

      {/* Wheel Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-4 flex items-center justify-center">
        {/* Pointer / Ticker Arrow */}
        <div className="absolute -top-3 z-20 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-red-600 drop-shadow-md" />

        {/* Rotating SVG Wheel */}
        <motion.div
          className="w-full h-full rounded-full shadow-2xl border-4 border-amber-400 overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.15, 0.99, 0.35, 1.0] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {PRIZES.map((prize, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = (i + 1) * sliceAngle;
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              // Text positioning
              const textAngle = startAngle + sliceAngle / 2;
              const textRad = (Math.PI * textAngle) / 180;
              const textX = 50 + 32 * Math.cos(textRad);
              const textY = 50 + 32 * Math.sin(textRad);

              return (
                <g key={i}>
                  <path d={pathData} fill={prize.color} stroke="#ffffff" strokeWidth="0.5" />
                  <text
                    x={textX}
                    y={textY}
                    fill={prize.textColor}
                    fontSize="3.2"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {prize.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Center Hub Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute z-10 w-16 h-16 rounded-full bg-white border-4 border-amber-500 shadow-lg flex items-center justify-center font-extrabold text-amber-700 text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-80"
        >
          {isSpinning ? "..." : "SPIN"}
        </button>
      </div>

      {/* Won Prize Banner */}
      {wonPrize && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center flex items-center gap-2 text-emerald-800 font-semibold text-xs"
        >
          <Trophy className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>You won: {wonPrize.label}! Opening registration form...</span>
        </motion.div>
      )}
    </div>
  );
}