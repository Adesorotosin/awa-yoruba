"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";

interface TrialRegistrationModalProps {
  rewardText?: string;
  earnedPoints?: number;
}

export function TrialRegistrationModal({
  rewardText = "1 Free Interactive Yoruba Trial Class",
  earnedPoints = 50,
}: TrialRegistrationModalProps) {
  const { isOpen, isLoading, error, successData, closeModal, submitRegistration } =
    useTrialRegistration();

  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    phone: "",
    childName: "",
    childAge: 7,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "childAge" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRegistration(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl sm:p-8 border border-amber-100"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {successData ? (
              /* Success State */
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Ẹ kú oríire! 🎉</h3>
                <p className="text-slate-600">
                  Your trial class for <strong className="text-slate-800">{formData.childName}</strong> is reserved! Check your email for full access details and scheduling options.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-4 w-full rounded-xl bg-amber-600 py-3 text-white font-semibold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Registration Form */
              <div>
                {/* Reward Banner */}
                <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-amber-200/60">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Spin Reward Unlocked!</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">{rewardText}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    +{earnedPoints} bonus points ready to transfer to your profile.
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-amber-600" />
                    Claim Your Trial Seat
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Fill out details below to finalize your slot in Àwa Yorùbá.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent / Guardian Name
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        required
                        value={formData.parentName}
                        onChange={handleChange}
                        placeholder="e.g. Olumide Adeleke"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="parent@example.com"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Child Name
                        </label>
                        <input
                          type="text"
                          name="childName"
                          required
                          value={formData.childName}
                          onChange={handleChange}
                          placeholder="Ayo"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Age
                        </label>
                        <select
                          name="childAge"
                          value={formData.childAge}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {Array.from({ length: 13 }, (_, i) => i + 4).map((age) => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 flex w-full items-center justify-center rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-700 disabled:opacity-50 shadow-lg shadow-amber-600/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reserving Seat...
                      </>
                    ) : (
                      "Confirm & Claim Spin Reward"
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}