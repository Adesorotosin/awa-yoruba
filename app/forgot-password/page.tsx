"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "We couldn't process your request.");
      }

      setMessage(data.message ?? "If an account exists for that email, a reset link will be sent shortly.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't process your request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#241C16]">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-bold text-[#114B33]">
          ← AWA Yoruba
        </Link>
        <div className="mt-8 rounded-3xl border border-[#E8DECE] bg-white p-7 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">
            Account recovery
          </p>
          <h1 className="mt-3 text-3xl font-black">Forgot your password?</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B5B4B]">
            Enter the email address you used for AWA Yoruba. If an account matches, we’ll send you a secure link to choose a new password. The link expires after 30 minutes.
          </p>

          {message && (
            <div role="status" className="mt-5 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold" htmlFor="recovery-email">
              Email address
            </label>
            <input
              id="recovery-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#114B33] px-4 py-3.5 font-black text-white disabled:opacity-50"
            >
              {loading ? "Sending link..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B5B4B]">
            Remembered it?{" "}
            <Link href="/login" className="font-black text-[#114B33]">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
