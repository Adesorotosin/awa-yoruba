"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("This reset link is missing or invalid. Please request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to reset your password.");
      }

      setComplete(true);
      setMessage(data.message ?? "Your password has been reset. You can now log in.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset your password.");
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
          <h1 className="mt-3 text-3xl font-black">Create a new password</h1>
          <p className="mt-3 text-sm leading-6 text-[#6B5B4B]">
            Choose a new password with at least 8 characters. For your security, this reset link can only be used once and expires after 30 minutes.
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

          {!complete ? (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-sm font-bold" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]"
              />

              <label className="block text-sm font-bold" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#114B33] px-4 py-3.5 font-black text-white disabled:opacity-50"
              >
                {loading ? "Updating password..." : "Update password"}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="mt-6 block w-full rounded-xl bg-[#114B33] px-4 py-3.5 text-center font-black text-white"
            >
              Go to login
            </Link>
          )}

          <p className="mt-6 text-center text-sm text-[#6B5B4B]">
            Need another link?{" "}
            <Link href="/forgot-password" className="font-black text-[#114B33]">
              Request a new reset email
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
