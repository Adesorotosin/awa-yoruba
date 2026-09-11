"use client";

import { useState, useEffect, useRef } from "react";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";

interface ClaimedRewardDetail {
  bonus: string;
  yorubaWord?: string;
  badge?: string;
  reward?: string;
  points?: number;
}

export default function TrialBookingForm() {
  const { registerTrial, loading, error, successData } = useTrialRegistration();
  const formSectionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    parentName: "",
    childName: "",
    email: "",
    phone: "",
    unlockedReward: "",
  });

  const [rewardBadge, setRewardBadge] = useState<string | null>(null);

  // Listen for custom reward event dispatched by SpinWheel or YorubaGameSection
  useEffect(() => {
    const handleRewardClaimed = (event: Event) => {
      const customEvent = event as CustomEvent<ClaimedRewardDetail>;
      const { bonus, yorubaWord, badge, reward } = customEvent.detail || {};

      const rewardText =
        reward ||
        (yorubaWord
          ? `${bonus} (Word learned: "${yorubaWord}")`
          : bonus || "Free Trial Session Unlocked");

      setFormData((prev) => ({
        ...prev,
        unlockedReward: rewardText,
      }));

      setRewardBadge(badge || "Spin Reward");

      // Smooth scroll down to the booking form so the parent can immediately fill details
      if (formSectionRef.current) {
        formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("yoruba-reward-claimed", handleRewardClaimed);

    return () => {
      window.removeEventListener("yoruba-reward-claimed", handleRewardClaimed);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerTrial(formData);
  };

  return (
    <section id="trial" ref={formSectionRef} className="py-16 bg-[#0B3524] text-white font-sans">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#D9A74A]/10 text-[#D9A74A] border border-[#D9A74A]/20 mb-2">
            🚀 Start Learning Yorùbá
          </span>
          <h2 className="text-3xl font-bold text-white">
            Book Your Free Trial Session
          </h2>
          <p className="text-[#A3C2B3] text-sm mt-2">
            Fill in your details below to schedule your child's free trial lesson and claim any unlocked bonuses.
          </p>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="bg-[#114B33] p-8 rounded-3xl border border-[#D9A74A]/40 text-center space-y-4 shadow-2xl">
            <div className="text-5xl">🎉</div>
            <h3 className="text-2xl font-bold text-[#D9A74A]">Trial Booked Successfully!</h3>
            <p className="text-sm text-[#A3C2B3]">
              Welcome aboard! We’ve reserved your free session and saved{" "}
              <span className="font-bold text-white">
                {successData.claimedPoints ?? successData.user?.points ?? 50} points
              </span>{" "}
              to your profile.
            </p>
            <p className="text-xs text-white/70">
              Check your inbox at <span className="underline">{formData.email}</span> for confirmation details.
            </p>
          </div>
        ) : (
          /* Form View */
          <form
            onSubmit={handleSubmit}
            className="bg-[#114B33] p-6 sm:p-8 rounded-3xl border border-[#23684B] space-y-4 shadow-2xl relative"
          >
            {/* Active Reward Alert Banner */}
            {rewardBadge && (
              <div className="bg-[#D9A74A]/10 border border-[#D9A74A]/40 p-4 rounded-2xl flex items-center space-x-3 text-left animate-pulse">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-xs font-bold text-[#D9A74A] uppercase tracking-wider">
                    Bonus Applied: {rewardBadge}
                  </p>
                  <p className="text-xs text-white mt-0.5">
                    {formData.unlockedReward}
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#A3C2B3]">
                Parent / Guardian Name
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required
                placeholder="e.g. Folake Adeleke"
                className="w-full bg-[#0B3524] border border-[#23684B] rounded-xl p-3.5 text-white placeholder-[#A3C2B3]/50 focus:outline-none focus:border-[#D9A74A] text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#A3C2B3]">
                Child Name & Age
              </label>
              <input
                type="text"
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                required
                placeholder="e.g. Tobi (8 years old)"
                className="w-full bg-[#0B3524] border border-[#23684B] rounded-xl p-3.5 text-white placeholder-[#A3C2B3]/50 focus:outline-none focus:border-[#D9A74A] text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#A3C2B3]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="parent@example.com"
                  className="w-full bg-[#0B3524] border border-[#23684B] rounded-xl p-3.5 text-white placeholder-[#A3C2B3]/50 focus:outline-none focus:border-[#D9A74A] text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#A3C2B3]">
                  Phone Number (WhatsApp)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  className="w-full bg-[#0B3524] border border-[#23684B] rounded-xl p-3.5 text-white placeholder-[#A3C2B3]/50 focus:outline-none focus:border-[#D9A74A] text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#D9A74A]">
                Unlocked Game Reward / Coupon
              </label>
              <input
                type="text"
                name="unlockedReward"
                value={formData.unlockedReward}
                onChange={handleChange}
                placeholder="Spin the wheel game above to auto-fill a free bonus!"
                className="w-full bg-[#0B3524] border border-[#D9A74A]/40 rounded-xl p-3.5 text-[#D9A74A] placeholder-[#D9A74A]/40 font-medium text-sm focus:outline-none focus:border-[#D9A74A] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D9A74A] hover:bg-[#c49339] disabled:opacity-50 text-[#114B33] font-extrabold py-4 rounded-xl transition-all shadow-lg active:scale-[0.99] text-sm sm:text-base cursor-pointer mt-2 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Registering & Claiming...</span>
              ) : (
                <span>Claim Free Trial + Unlocked Bonus 🎯</span>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}