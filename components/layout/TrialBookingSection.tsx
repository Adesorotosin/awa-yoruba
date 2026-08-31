"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function TrialBookingSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., API route, Supabase, or email service)
    setSubmitted(true);
  };

  return (
    <section
      id="trial"
      className="bg-[#FFF8ED] px-6 lg:px-16 py-16 lg:py-24 font-sans border-t border-[#EBE3D5]"
    >
      <div className="max-w-4xl mx-auto text-center space-y-4">
        {/* Section Tag */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#D97706] uppercase">
          START YOUR JOURNEY
        </p>

        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-3xl mx-auto">
          Book Your Child’s Free 30-Minute Trial Session
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#55665E] max-w-xl mx-auto pt-1">
          No commitment required. We’ll assess your child’s starting level and match them with the perfect native tutor.
        </p>

        {/* Form Container */}
        <div className="pt-8 max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-[#FFFDF9] p-8 lg:p-12 rounded-[32px] border border-[#EBE3D5] shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E6ECE8] text-[#154734] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A2621]">
                Ẹ ku ábọ̀! Trial Request Received
              </h3>
              <p className="text-sm sm:text-base text-[#55665E]">
                We’ve sent a confirmation email to your inbox. Our team will reach out via WhatsApp/Email to schedule your 30-minute introductory call.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-[#FFFDF9] p-6 sm:p-8 lg:p-10 rounded-[32px] border border-[#EBE3D5] shadow-sm text-left space-y-5"
            >
              {/* Parent Name */}
              <div>
                <label className="block text-sm font-bold text-[#1A2621] mb-2">
                  Parent’s Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Funmi Adeleke"
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#EBE3D5] bg-white text-[#1A2621] text-sm focus:outline-none focus:border-[#114B33] focus:ring-1 focus:ring-[#114B33] transition-all"
                />
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#1A2621] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    className="w-full px-4 py-3.5 rounded-2xl border border-[#EBE3D5] bg-white text-[#1A2621] text-sm focus:outline-none focus:border-[#114B33] focus:ring-1 focus:ring-[#114B33] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A2621] mb-2">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3.5 rounded-2xl border border-[#EBE3D5] bg-white text-[#1A2621] text-sm focus:outline-none focus:border-[#114B33] focus:ring-1 focus:ring-[#114B33] transition-all"
                  />
                </div>
              </div>

              {/* Child's Age Select */}
              <div>
                <label className="block text-sm font-bold text-[#1A2621] mb-2">
                  Child’s Age Group
                </label>
                <select
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#EBE3D5] bg-white text-[#1A2621] text-sm focus:outline-none focus:border-[#114B33] focus:ring-1 focus:ring-[#114B33] transition-all"
                >
                  <option value="">Select age range</option>
                  <option value="5-7">Ages 5–7 (Little Explorers)</option>
                  <option value="8-10">Ages 8–10 (Young Speakers)</option>
                  <option value="11-12">Ages 11–12 (Heritage Builders)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#114B33] hover:bg-[#0B3524] text-white font-semibold py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-base flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#D9A74A]" />
                <span>Claim Free Trial Session</span>
              </button>

              <p className="text-xs text-center text-[#55665E] pt-2">
                🔒 100% free. No credit card required. Cancel anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}