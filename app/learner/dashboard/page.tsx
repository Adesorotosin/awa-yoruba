"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Booking = {
  id: string; scheduledAt: string; durationMinutes: number; priceAmount: number;
  totalAmount: number; currency: string; status: string; paymentStatus: string;
  tutorProfile?: { id: string; displayName: string | null; photoUrl: string | null; averageRating: number } | null;
  level?: { id: string; name: string } | null;
};

type DashboardData = {
  learner: { name: string | null; email: string | null; learningGoal: string | null;
    currentLevel: { id: string; name: string; description: string | null } | null };
  stats: { upcomingLessons: number; pendingBookings: number; completedLessons: number; availableCredit: number };
  bookings: Booking[];
};

function money(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos",
  }).format(new Date(value));
}
function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="rounded-2xl border border-[#E8DECE] bg-white p-5">
    <p className="text-sm font-semibold text-[#6B5B4B]">{label}</p>
    <p className="mt-2 text-3xl font-black text-[#241C16]">{value}</p>
    <p className="mt-1 text-xs text-[#8A7968]">{detail}</p>
  </div>;
}

export default function LearnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learner/dashboard")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          if (response.status === 401) { window.location.href = "/login"; return null; }
          throw new Error(payload.error ?? "Unable to load dashboard.");
        }
        return payload;
      })
      .then((payload) => { if (payload) setData(payload); })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (loading) return <main className="min-h-screen bg-[#FFF8ED] p-8 text-[#241C16]">Loading your dashboard...</main>;
  if (error || !data) return <main className="min-h-screen bg-[#FFF8ED] p-8 text-[#241C16]">
    <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6">
      <p className="font-bold text-red-700">{error || "Unable to load dashboard."}</p>
      <Link href="/login" className="mt-4 inline-block font-bold text-[#114B33]">Log in again</Link>
    </div>
  </main>;

  const greeting = data.learner.name ? "Àkàbọ̀, " + data.learner.name + "." : "Àkàbọ̀.";

  return <main className="min-h-screen bg-[#FFF8ED] text-[#241C16]">
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#E8DECE] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="AWA Yoruba" width={120} height={36} priority className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/tutors" className="hidden text-sm font-bold text-[#114B33] sm:inline">Find a tutor</Link>
          <Link href="/challenge" className="hidden text-sm font-bold text-[#114B33] sm:inline">Yoruba Challenge</Link>
          <button onClick={logout} className="rounded-xl border border-[#DCCFBD] px-4 py-2 text-sm font-bold hover:bg-[#FFF8ED]">Log out</button>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-5 pb-8 pt-[6.5rem] sm:px-8">
      <section className="rounded-3xl bg-[#114B33] p-7 text-white sm:p-9">
        <p className="text-sm font-semibold text-[#DCE9DF]">Learner dashboard</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{greeting}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EAF3EC]">Keep your Yoruba learning journey moving. Find a tutor, book your next lesson, and build your confidence one conversation at a time.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tutors" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#114B33]">Find a tutor</Link>
          <Link href="/challenge" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white">Test your Yoruba</Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming lessons" value={data.stats.upcomingLessons} detail="Pending or confirmed" />
        <StatCard label="Pending bookings" value={data.stats.pendingBookings} detail="Waiting for tutor confirmation" />
        <StatCard label="Completed lessons" value={data.stats.completedLessons} detail="Your learning history" />
        <StatCard label="Learning credit" value={money(data.stats.availableCredit)} detail="Available toward learning" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="rounded-3xl border border-[#E8DECE] bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Your lessons</p><h2 className="mt-2 text-2xl font-black">Upcoming & recent bookings</h2></div>
            <Link href="/tutors" className="text-sm font-black text-[#114B33]">Find tutors →</Link>
          </div>
          {data.bookings.length === 0 ? <div className="mt-6 rounded-2xl bg-[#FFF8ED] p-6 text-center">
            <p className="font-bold">No lessons yet.</p><p className="mt-1 text-sm text-[#6B5B4B]">Your first Yoruba lesson is a few clicks away.</p>
            <Link href="/tutors" className="mt-4 inline-block rounded-xl bg-[#114B33] px-5 py-3 text-sm font-black text-white">Browse tutors</Link>
          </div> : <div className="mt-5 space-y-3">{data.bookings.map((booking) => <div key={booking.id} className="rounded-2xl border border-[#E8DECE] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {booking.tutorProfile?.photoUrl ? <Image src={booking.tutorProfile.photoUrl} alt={booking.tutorProfile.displayName || "Tutor"} width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized /> :
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0EA] font-black text-[#114B33]">{(booking.tutorProfile?.displayName || "T").slice(0, 1).toUpperCase()}</div>}
                <div><p className="font-black">{booking.tutorProfile?.displayName || "Yoruba Tutor"}</p><p className="mt-1 text-sm text-[#6B5B4B]">{formatDate(booking.scheduledAt)}</p></div>
              </div>
              <div className="sm:text-right"><p className="font-black">{money(booking.totalAmount, booking.currency)}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#8A7968]">{booking.status} · {booking.paymentStatus}</p></div>
            </div>
          </div>)}</div>}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#E8DECE] bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Your learning</p><h2 className="mt-2 text-xl font-black">Current level</h2>
            {data.learner.currentLevel ? <><p className="mt-4 rounded-xl bg-[#FFF8ED] p-4 font-black text-[#114B33]">{data.learner.currentLevel.name}</p>{data.learner.currentLevel.description && <p className="mt-3 text-sm leading-6 text-[#6B5B4B]">{data.learner.currentLevel.description}</p>}</> :
              <p className="mt-4 text-sm leading-6 text-[#6B5B4B]">Your level will be set as your learning journey develops.</p>}
          </div>
          <div className="rounded-3xl border border-[#E8DECE] bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Learning credit</p><h2 className="mt-2 text-xl font-black">{money(data.stats.availableCredit)}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B5B4B]">Credits earned from eligible Yoruba challenges can reduce the cost of your learning.</p>
            <Link href="/challenge" className="mt-4 inline-block text-sm font-black text-[#114B33]">Take the challenge →</Link>
          </div>
        </aside>
      </section>
    </div>
  </main>;
}
