"use client";

import { useState, useEffect, useCallback } from "react";

export interface RegistrationFormData {
  parentName: string;
  email: string;
  phone?: string;
  childName: string;
  childAge?: number | string;
  unlockedReward?: string;
}

export interface UseTrialRegistrationReturn {
  isOpen: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading to keep TrialBookingSection working
  error: string | null;
  successData: any | null;
  openModal: () => void;
  closeModal: () => void;
  submitRegistration: (data: RegistrationFormData) => Promise<void>;
  registerTrial: (data: RegistrationFormData) => Promise<void>; // Alias for submitRegistration
}

export function useTrialRegistration(): UseTrialRegistrationReturn {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  // Listen for custom trigger event fired when a guest completes a reward action
  useEffect(() => {
    const handleRewardClaimed = () => {
      openModal();
    };

    window.addEventListener("yoruba-reward-claimed", handleRewardClaimed);
    return () => {
      window.removeEventListener("yoruba-reward-claimed", handleRewardClaimed);
    };
  }, [openModal]);

  const submitRegistration = async (formData: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trial/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register trial booking");
      }

      setSuccessData(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    loading: isLoading, // Maps `loading` property expected by TrialBookingSection
    error,
    successData,
    openModal,
    closeModal,
    submitRegistration,
    registerTrial: submitRegistration, // Maps `registerTrial` property expected by TrialBookingSection
  };
}