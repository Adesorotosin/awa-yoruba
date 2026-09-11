"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Reward {
  id: number;
  label: string;
  yorubaWord: string;
  meaning: string;
  badge: string;
  bonus: string;
  color: string;
  audioPath: string;
}

const REWARDS: Reward[] = [
  {
    id: 0,
    label: "Ẹ Kú Àárọ̀",
    yorubaWord: "Ẹ kú àárọ̀",
    meaning: "Good Morning",
    badge: "👑 Ọba / Ọba Bìnrin (Royal Explorer)",
    bonus: "Free Printable Yorùbá Activity Kit",
    color: "#D9A74A",
    audioPath: "",
  },
  {
    id: 1,
    label: "Ẹ Kú Ọ̀sán",
    yorubaWord: "Ẹ kú ọ̀sán",
    meaning: "Good Afternoon",
    badge: "🌟 Àràbà (Wise Scholar)",
    bonus: "Priority Trial Slot + Flashcards",
    color: "#1d6b4b",
    audioPath: "",
  },
  {
    id: 2,
    label: "Ẹ Kú Alẹ́",
    yorubaWord: "Ẹ kú alẹ́",
    meaning: "Good Evening",
    badge: "🚀 Akọni (Brave Hero)",
    bonus: "1 Free Alphabet Audio Pack",
    color: "#154734",
    audioPath: "",
  },
  {
    id: 3,
    label: "Ẹ Kú Àbọ̀",
    yorubaWord: "Ẹ kú àbọ̀",
    meaning: "Welcome",
    badge: "🛡️ Olùṣọ́ (Cultural Guardian)",
    bonus: "1-on-1 Cultural Coaching Session",
    color: "#8C6328",
    audioPath: "",
  },
  {
    id: 4,
    label: "Ẹ Ṣeun",
    yorubaWord: "Ẹ ṣeun",
    meaning: "Thank You",
    badge: "✨ Ọ̀rẹ́ (Kind Friend)",
    bonus: "Yorùbá Song & Nursery Rhymes Pack",
    color: "#0B3524",
    audioPath: "",
  },
  {
    id: 5,
    label: "Ẹ Kú Ìkalẹ̀",
    yorubaWord: "Ẹ kú ìkalẹ̀",
    meaning: "Greetings to Sitters",
    badge: "🎓 Oníṣègùn (Knowledge Keeper)",
    bonus: "Storybook PDF: 'The Tortoise & The Elephant'",
    color: "#23684B",
    audioPath: "",
  },
];

type GameMode = "wheel" | "sound" | "chest";

export default function YorubaGameSection() {
  const [mounted, setMounted] = useState(false);
  const [activeGame, setActiveGame] = useState<GameMode>("wheel");

  // Spin Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Sound Quiz State
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);

  // Shared Modal State
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Web Audio Synthesizer for Wheel Tick
  const playTickSound = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const playYorubaAudio = (reward: Reward) => {
    if (reward.audioPath) {
      const audio = new Audio(reward.audioPath);
      audio.play().catch(() => speakYorubaWordFallback(reward.yorubaWord));
    } else {
      speakYorubaWordFallback(reward.yorubaWord);
    }
  };

  const speakYorubaWordFallback = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerRewardWin = (winner: Reward) => {
    setWonReward(winner);
    playYorubaAudio(winner);

    try {
      if (typeof confetti === "function") {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } catch (e) {}
  };

  // --- GAME 1: SPIN WHEEL ---
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);

    const selectedIndex = Math.floor(Math.random() * REWARDS.length);
    const numSlices = REWARDS.length;
    const sliceAngle = 360 / numSlices;
    const targetSliceAngle = 360 - selectedIndex * sliceAngle - sliceAngle / 2;
    const extraSpins = 5 * 360;
    const newRotation = rotation + extraSpins + (targetSliceAngle - (rotation % 360));

    setRotation(newRotation);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playTickSound();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      triggerRewardWin(REWARDS[selectedIndex]);
    }, 3500);
  };

  // --- GAME 2: SOUND QUIZ ---
  const currentQuizItem = REWARDS[quizQuestionIndex];

  const handleAnswerClick = (meaning: string) => {
    setSelectedAnswer(meaning);
    if (meaning === currentQuizItem.meaning) {
      setQuizFeedback("correct");
      setTimeout(() => {
        triggerRewardWin(currentQuizItem);
        setQuizFeedback(null);
        setSelectedAnswer(null);
      }, 700);
    } else {
      setQuizFeedback("wrong");
      setTimeout(() => setQuizFeedback(null), 1200);
    }
  };

  // --- GAME 3: TREASURE BOX ---
  const handlePickChest = (reward: Reward) => {
    triggerRewardWin(reward);
  };

  const handleClaimReward = () => {
    if (wonReward) {
      const event = new CustomEvent("yoruba-reward-claimed", {
        detail: {
          bonus: wonReward.bonus,
          yorubaWord: wonReward.yorubaWord,
          badge: wonReward.badge,
        },
      });
      window.dispatchEvent(event);
    }

    const trialSection = document.getElementById("trial");
    if (trialSection) {
      trialSection.scrollIntoView({ behavior: "smooth" });
    }
    setWonReward(null);
  };

  if (!mounted) {
    return (
      <section className="py-16 bg-[#0B3524]/60 border-y border-[#1d6b4b]/40 relative overflow-hidden font-sans min-h-[520px]" />
    );
  }

  return (
    <section className="py-16 bg-[#0B3524]/60 border-y border-[#1d6b4b]/40 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#D9A74A]/10 text-[#D9A74A] border border-[#D9A74A]/20 mb-3">
          🎯 Play & Learn Yorùbá
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Unlock Your Child's Yorùbá Reward
        </h2>
        <p className="text-[#A3C2B3] text-sm sm:text-base max-w-xl mx-auto mb-8">
          Pick your favorite game mode below to earn a cultural badge and unlock a free trial bonus!
        </p>

        {/* Game Mode Tabs */}
        <div className="inline-flex bg-[#072418] p-1.5 rounded-2xl border border-[#1d6b4b]/50 mb-10 shadow-inner">
          <button
            onClick={() => setActiveGame("wheel")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeGame === "wheel"
                ? "bg-[#D9A74A] text-[#114B33] shadow-md"
                : "text-[#A3C2B3] hover:text-white"
            }`}
          >
            🎡 Spin Wheel
          </button>
          <button
            onClick={() => {
              setActiveGame("sound");
              playYorubaAudio(currentQuizItem);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeGame === "sound"
                ? "bg-[#D9A74A] text-[#114B33] shadow-md"
                : "text-[#A3C2B3] hover:text-white"
            }`}
          >
            🔊 Sound Quiz
          </button>
          <button
            onClick={() => setActiveGame("chest")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeGame === "chest"
                ? "bg-[#D9A74A] text-[#114B33] shadow-md"
                : "text-[#A3C2B3] hover:text-white"
            }`}
          >
            🎁 Treasure Box
          </button>
        </div>

        {/* MODE 1: SPIN WHEEL */}
        {activeGame === "wheel" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto mb-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-[#D9A74A] filter drop-shadow-md" />

              <div
                className="w-full h-full rounded-full border-4 border-[#D9A74A] shadow-[0_0_30px_rgba(217,167,74,0.3)] relative overflow-hidden transition-all ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? "3500ms" : "0ms",
                  transitionTimingFunction: "cubic-bezier(0.15, 0.9, 0.2, 1)",
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {REWARDS.map((reward, index) => {
                    const sliceAngle = 360 / REWARDS.length;
                    const startAngle = index * sliceAngle;
                    const endAngle = (index + 1) * sliceAngle;

                    const x1 = (50 + 50 * Math.cos((Math.PI * startAngle) / 180)).toFixed(4);
                    const y1 = (50 + 50 * Math.sin((Math.PI * startAngle) / 180)).toFixed(4);
                    const x2 = (50 + 50 * Math.cos((Math.PI * endAngle) / 180)).toFixed(4);
                    const y2 = (50 + 50 * Math.sin((Math.PI * endAngle) / 180)).toFixed(4);

                    const textAngle = startAngle + sliceAngle / 2;
                    const textX = (50 + 32 * Math.cos((Math.PI * textAngle) / 180)).toFixed(4);
                    const textY = (50 + 32 * Math.sin((Math.PI * textAngle) / 180)).toFixed(4);

                    return (
                      <g key={reward.id}>
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                          fill={reward.color}
                          stroke="#0B3524"
                          strokeWidth="0.8"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="#FFFFFF"
                          fontSize="3.8"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        >
                          {reward.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D9A74A] text-[#114B33] font-extrabold text-base sm:text-lg border-4 border-[#0B3524] shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer disabled:opacity-80"
              >
                <span>{isSpinning ? "🌀" : "SPIN!"}</span>
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {isSpinning ? "Spinning" : "Tap Here"}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* MODE 2: SOUND QUIZ */}
        {activeGame === "sound" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto bg-[#114B33] border border-[#23684B] rounded-3xl p-6 shadow-xl"
          >
            <p className="text-xs text-[#D9A74A] font-bold uppercase tracking-wider mb-3">
              Listen & Match the Meaning
            </p>

            <button
              onClick={() => playYorubaAudio(currentQuizItem)}
              className="w-20 h-20 mx-auto rounded-full bg-[#D9A74A] hover:bg-[#c49339] text-[#114B33] text-3xl flex items-center justify-center shadow-lg transform active:scale-95 transition-all mb-4 cursor-pointer"
            >
              🔊
            </button>

            <p className="text-white text-lg font-bold mb-6">
              "{currentQuizItem.yorubaWord}"
            </p>

            <div className="space-y-3">
              {[
                currentQuizItem.meaning,
                REWARDS[(quizQuestionIndex + 1) % REWARDS.length].meaning,
                REWARDS[(quizQuestionIndex + 2) % REWARDS.length].meaning,
              ]
                .sort()
                .map((meaningOption) => {
                  const isSelected = selectedAnswer === meaningOption;
                  return (
                    <button
                      key={meaningOption}
                      onClick={() => handleAnswerClick(meaningOption)}
                      className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all border cursor-pointer ${
                        isSelected && quizFeedback === "correct"
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : isSelected && quizFeedback === "wrong"
                          ? "bg-red-500 text-white border-red-400"
                          : "bg-[#0B3524] text-white border-[#23684B] hover:border-[#D9A74A]"
                      }`}
                    >
                      {meaningOption}
                    </button>
                  );
                })}
            </div>

            {quizFeedback === "wrong" && (
              <p className="text-xs text-red-400 mt-3 animate-shake">
                Not quite! Tap the audio speaker and try again.
              </p>
            )}
          </motion.div>
        )}

        {/* MODE 3: TREASURE BOX */}
        {activeGame === "chest" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto"
          >
            <p className="text-xs text-[#D9A74A] font-medium mb-6">
              Tap a Yorùbá cultural treasure box to reveal your prize!
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {[0, 1, 2].map((boxIdx) => {
                const reward = REWARDS[boxIdx * 2];
                return (
                  <button
                    key={boxIdx}
                    onClick={() => handlePickChest(reward)}
                    className="group bg-[#114B33] border-2 border-[#D9A74A]/50 hover:border-[#D9A74A] p-6 sm:p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all shadow-xl flex flex-col items-center justify-center space-y-3"
                  >
                    <span className="text-5xl group-hover:animate-bounce">🎁</span>
                    <span className="text-xs font-bold text-[#D9A74A] uppercase tracking-wider">
                      Box #{boxIdx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* SHARED REWARD MODAL */}
      <AnimatePresence>
        {wonReward && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-[#0B3524] border border-[#D9A74A]/50 rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl"
            >
              <div className="text-6xl mb-2 animate-pulse">🎉</div>
              <span className="text-xs font-bold text-[#D9A74A] uppercase tracking-widest">
                Prize Unlocked!
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-1">{wonReward.badge}</h3>

              <div className="bg-[#114B33] border border-[#23684B] rounded-2xl p-4 my-4 space-y-2 text-center">
                <p className="text-xs text-[#A3C2B3]">Yorùbá Word Unlocked:</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl font-bold text-white">"{wonReward.yorubaWord}"</span>
                  <button
                    onClick={() => playYorubaAudio(wonReward)}
                    className="p-1.5 bg-[#D9A74A]/20 hover:bg-[#D9A74A]/40 rounded-full text-sm text-[#D9A74A] transition-colors cursor-pointer"
                    title="Listen to pronunciation"
                  >
                    🔊
                  </button>
                </div>
                <p className="text-xs text-[#D9A74A]">({wonReward.meaning})</p>
                <hr className="border-[#23684B] my-2" />
                <p className="text-xs text-[#A3C2B3]">Free Trial Bonus:</p>
                <p className="text-sm font-bold text-[#D9A74A]">{wonReward.bonus}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleClaimReward}
                  className="w-full bg-[#D9A74A] hover:bg-[#c49339] text-[#114B33] font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99] text-sm cursor-pointer"
                >
                  Show Mom/Dad to Claim Bonus
                </button>
                <button
                  onClick={() => setWonReward(null)}
                  className="text-xs text-[#A3C2B3] hover:text-white transition-colors cursor-pointer"
                >
                  Play again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}