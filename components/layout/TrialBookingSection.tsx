"use client";

import { useState } from "react";

export default function TrialBookingSection() {
  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    phone: "",
    childAge: "5–7",
    preferredTime: "Weekend Morning",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking request.");
      }

      setStatus("success");
      setFormData({
        parentName: "",
        email: "",
        phone: "",
        childAge: "5–7",
        preferredTime: "Weekend Morning",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section id="trial" className="bg-[#114B33] text-white py-20 px-6 lg:px-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 bg-[#0B3524] p-8 sm:p-12 rounded-[32px] border border-[#1d6b4b] shadow-2xl">
        
        <div className="text-center space-y-3">
          <span className="text-[#D9A74A] text-xs font-bold tracking-widest uppercase">
            Start Your Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Book a Free 1-on-1 Trial Lesson
          </h2>
          <p className="text-sm sm:text-base text-[#A3C2B3] max-w-lg mx-auto">
            Experience how our interactive sessions engage your child with Yoruba language and culture. No commitment required.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-[#154734] border border-[#277355] p-6 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 bg-[#D9A74A] text-[#114B33] rounded-full flex items-center justify-center font-bold text-xl mx-auto">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">Booking Received!</h3>
            <p className="text-sm text-[#C8E0D5]">
              Ẹ ṣeun! We’ve received your request and will email you within 24 hours to confirm your scheduled slot.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-xs font-semibold text-[#D9A74A] underline hover:text-white transition-colors"
            >
              Submit another booking
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
              <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Parent Name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#C8E0D5]">
                  Parent's Full Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  required
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="w-full bg-[#114B33] border border-[#23684B] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5A8572] focus:outline-none focus:ring-2 focus:ring-[#D9A74A] transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#C8E0D5]">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="parent@example.com"
                  className="w-full bg-[#114B33] border border-[#23684B] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5A8572] focus:outline-none focus:ring-2 focus:ring-[#D9A74A] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Phone / WhatsApp */}
              <div className="space-y-2 sm:col-span-1">
                <label className="block text-xs font-medium text-[#C8E0D5]">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#114B33] border border-[#23684B] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5A8572] focus:outline-none focus:ring-2 focus:ring-[#D9A74A] transition-all"
                />
              </div>

              {/* Child Age */}
              <div className="space-y-2 sm:col-span-1">
                <label className="block text-xs font-medium text-[#C8E0D5]">
                  Child's Age Group
                </label>
                <select
                  name="childAge"
                  value={formData.childAge}
                  onChange={handleChange}
                  className="w-full bg-[#114B33] border border-[#23684B] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D9A74A] transition-all"
                >
                  <option value="5–7">Ages 5–7 (Little Explorers)</option>
                  <option value="8–10">Ages 8–10 (Young Speakers)</option>
                  <option value="11–12">Ages 11–12 (Heritage Builders)</option>
                </select>
              </div>

              {/* Preferred Schedule */}
              <div className="space-y-2 sm:col-span-1">
                <label className="block text-xs font-medium text-[#C8E0D5]">
                  Preferred Time
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full bg-[#114B33] border border-[#23684B] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D9A74A] transition-all"
                >
                  <option value="Weekend Morning">Weekend Morning</option>
                  <option value="Weekend Afternoon">Weekend Afternoon</option>
                  <option value="Weekday Evening">Weekday Evening</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#D9A74A] hover:bg-[#c49339] text-[#114B33] font-bold py-4 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.99] disabled:opacity-50 text-base cursor-pointer mt-4"
            >
              {status === "loading" ? "Submitting Request..." : "Confirm Free Trial Booking"}
            </button>
          </form>
        )}

      </div>
    </section>
  );
}