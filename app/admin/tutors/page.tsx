"use client";

import { useCallback, useEffect, useState } from "react";

type TutorApplication = {
  id: string;
  displayName: string | null;
  bio: string | null;
  qualifications: string | null;
  experienceYears: number | null;
  languages: string | null;
  specialties: string | null;
  hourlyRate: number | null;
  applicationStatus: string;
  verificationStatus: string;
  isPublished: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
};

export default function AdminTutorsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadApplications = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/tutors", {
        headers: {
          "x-admin-key": key,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load applications.");
      }

      setAdminKey(key);
      setApplications(data.applications);
    } catch (err) {
      setApplications([]);
      setError(err instanceof Error ? err.message : "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedKey = window.sessionStorage.getItem("awa-admin-key");
    if (savedKey) {
      setKeyInput(savedKey);
      void loadApplications(savedKey);
    }
  }, [loadApplications]);

  async function handleAction(tutorProfileId: string, action: "approve" | "reject") {
    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this tutor and publish their profile?"
        : "Reject this tutor application?",
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/tutors", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ tutorProfileId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update application.");
      }

      setApplications((current) =>
        current.filter((application) => application.id !== tutorProfileId),
      );

      setMessage(
        action === "approve"
          ? "Tutor approved and published successfully."
          : "Tutor application rejected.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update application.");
    } finally {
      setLoading(false);
    }
  }

  function unlockAdmin() {
    const key = keyInput.trim();

    if (!key) {
      setError("Enter your admin key.");
      return;
    }

    window.sessionStorage.setItem("awa-admin-key", key);
    void loadApplications(key);
  }

  function signOutAdmin() {
    window.sessionStorage.removeItem("awa-admin-key");
    setAdminKey("");
    setKeyInput("");
    setApplications([]);
    setMessage("");
    setError("");
  }

  if (!adminKey) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#241E17]">
        <div className="mx-auto max-w-md rounded-3xl border border-[#E8DECE] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7655FB]">
            AWA Yoruba Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Tutor applications
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E655B]">
            Enter the admin key configured for this development environment.
          </p>

          <input
            type="password"
            value={keyInput}
            onChange={(event) => setKeyInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") unlockAdmin();
            }}
            placeholder="Admin key"
            className="mt-6 w-full rounded-2xl border border-[#DCCFBD] bg-[#FFFCF7] px-4 py-3 outline-none focus:border-[#7655FB]"
          />

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={unlockAdmin}
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-[#241E17] px-4 py-3 font-semibold text-white transition hover:bg-[#3A3128] disabled:opacity-60"
          >
            {loading ? "Checking..." : "Open admin"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-5 py-10 text-[#241E17] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-[#E8DECE] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7655FB]">
              AWA Yoruba Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tutor applications
            </h1>
            <p className="mt-2 text-sm text-[#6E655B]">
              Review applicants before their profiles appear in the marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={signOutAdmin}
            className="rounded-xl border border-[#DCCFBD] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#FFFCF7]"
          >
            Lock admin
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-[#E8DECE] bg-white p-8 text-sm text-[#6E655B]">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-3xl border border-[#E8DECE] bg-white p-10 text-center">
              <h2 className="text-xl font-semibold">No pending applications</h2>
              <p className="mt-2 text-sm text-[#6E655B]">
                New tutor applications will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-3xl border border-[#E8DECE] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold">
                          {application.displayName || application.user.name || "Unnamed tutor"}
                        </h2>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Pending review
                        </span>
                      </div>

                      <div className="mt-3 grid gap-1 text-sm text-[#6E655B]">
                        <p>{application.user.email}</p>
                        <p>{application.user.phone}</p>
                        <p>
                          {application.experienceYears ?? 0} years experience · ₦
                          {(application.hourlyRate ?? 0).toLocaleString()}/hour
                        </p>
                      </div>

                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8176]">
                            Specialties
                          </p>
                          <p className="mt-1 text-sm leading-6">{application.specialties}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8176]">
                            Languages
                          </p>
                          <p className="mt-1 text-sm leading-6">{application.languages}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8176]">
                            Qualifications
                          </p>
                          <p className="mt-1 text-sm leading-6">{application.qualifications}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8176]">
                            Application date
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {new Date(application.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl bg-[#FFFCF7] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8176]">
                          Bio
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#4F473F]">
                          {application.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:w-44 lg:flex-col">
                      <button
                        type="button"
                        onClick={() => handleAction(application.id, "approve")}
                        disabled={loading}
                        className="rounded-2xl bg-[#7655FB] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6544EA] disabled:opacity-60"
                      >
                        Approve & publish
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(application.id, "reject")}
                        disabled={loading}
                        className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
