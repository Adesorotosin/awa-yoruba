"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Booking = {
  id: string; scheduledAt: string; durationMinutes: number; priceAmount: number;
  totalAmount: number; currency: string; status: string; paymentStatus: string;
  tutorProfile?: { id: string; displayName: string | null; photoUrl: string | null; averageRating: number } | null;
  level?: { id: string; name: string } | null;
  childProfile?: { id: string; name: string; age: number | null; currentLevel?: { id: string; name: string } | null } | null;
};

type DashboardData = {
  learner: { name: string | null; email: string | null; learningGoal: string | null;
    currentLevel: { id: string; name: string; description: string | null } | null };
  stats: { upcomingLessons: number; pendingBookings: number; completedLessons: number; availableCredit: number };
  bookings: Booking[];
  children: { id: string; name: string; age: number | null; currentLevel: { id: string; name: string } | null }[];
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
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childError, setChildError] = useState("");
  const [addingChild, setAddingChild] = useState(false);

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

  async function addChild(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddingChild(true); setChildError("");
    try {
      const response = await fetch("/api/learner/children", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: childName, age: childAge || null }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to add child.");
      setChildName(""); setChildAge("");
      const refreshed = await fetch("/api/learner/dashboard");
      if (refreshed.ok) setData(await refreshed.json());
    } catch (err) { setChildError(err instanceof Error ? err.message : "Unable to add child."); }
    finally { setAddingChild(false); }
  }

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
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="AWA Yoruba" width={144} height={44} priority className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/tutors" className="hidden text-base font-bold text-[#114B33] sm:inline">Find a tutor</Link>
          <Link href="/challenge" className="hidden text-sm font-bold text-[#114B33] sm:inline">Yoruba Challenge</Link>
          <button onClick={logout} className="rounded-xl border border-[#DCCFBD] px-5 py-2.5 text-sm font-bold hover:bg-[#FFF8ED]">Log out</button>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-5 pb-8 pt-[8rem] sm:px-8">
      <section className="rounded-3xl bg-[#114B33] p-7 text-white sm:p-9">
        <p className="text-sm font-semibold text-[#DCE9DF]">Parent dashboard</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{greeting}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EAF3EC]">Help your child build confidence in Yoruba with live lessons, trusted tutors, and a simple view of their progress.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tutors" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#114B33]">Find a tutor</Link>
          <Link href="/challenge" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white">Test your Yoruba</Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming lessons" value={data.stats.upcomingLessons} detail="For your family" />
        <StatCard label="Pending bookings" value={data.stats.pendingBookings} detail="Waiting for tutor confirmation" />
        <StatCard label="Completed lessons" value={data.stats.completedLessons} detail="Your learning history" />
        <StatCard label="Learning credit" value={money(data.stats.availableCredit)} detail="Available toward learning" />
      </section>

      <section className="mt-8 rounded-3xl border border-[#E8DECE] bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Your family</p><h2 className="mt-2 text-2xl font-black">Children learning Yoruba</h2><p className="mt-2 text-sm text-[#6B5B4B]">Each child can have their own level, lessons, and learning journey.</p></div>
          <Link href="/learner/dashboard#add-child" className="inline-flex rounded-xl bg-[#114B33] px-4 py-2.5 text-sm font-black text-white">Add a child</Link>
        </div>
        {data.children.length === 0 ? <div className="mt-5 rounded-2xl bg-[#FFF8ED] p-5"><p className="font-bold">Start with your child’s profile.</p><p className="mt-1 text-sm text-[#6B5B4B]">Add your child so AWA Yoruba can personalize lessons and progress around them.</p><Link href="/learner/dashboard#add-child" className="mt-4 inline-block font-black text-[#114B33]">Add child →</Link></div> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.children.map((child) => <div key={child.id} className="rounded-2xl border border-[#E8DECE] p-5"><p className="text-lg font-black">{child.name}</p>{child.age && <p className="mt-1 text-sm text-[#6B5B4B]">Age {child.age}</p>}<div className="mt-4 rounded-xl bg-[#FFF8ED] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#8A7968]">Current level</p><p className="mt-1 font-black text-[#114B33]">{child.currentLevel?.name ?? "Not assessed yet"}</p></div><Link href="/tutors" className="mt-4 inline-block text-sm font-black text-[#114B33]">Find a tutor →</Link></div>)}</div>}
        <form onSubmit={addChild} className="mt-6 rounded-2xl border border-dashed border-[#DCCFBD] bg-[#FFFDF9] p-5">
          <p className="font-black">Add a child</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
            <input value={childName} onChange={(e) => setChildName(e.target.value)} required placeholder="Child's name" className="rounded-xl border border-[#DCCFBD] bg-white px-4 py-3 text-sm outline-none focus:border-[#114B33]" />
            <input value={childAge} onChange={(e) => setChildAge(e.target.value)} type="number" min="2" max="18" placeholder="Age" className="rounded-xl border border-[#DCCFBD] bg-white px-4 py-3 text-sm outline-none focus:border-[#114B33]" />
            <button disabled={addingChild} type="submit" className="rounded-xl bg-[#114B33] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{addingChild ? "Adding..." : "Add child"}</button>
          </div>
          {childError && <p className="mt-3 text-sm font-semibold text-red-700">{childError}</p>}
        </form>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <div className="rounded-3xl border border-[#E8DECE] bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Your family lessons</p><h2 className="mt-2 text-2xl font-black">Upcoming & recent bookings</h2></div>
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
                <div><p className="font-black">{booking.tutorProfile?.displayName || "Yoruba Tutor"}</p><p className="mt-1 text-sm text-[#6B5B4B]">{formatDate(booking.scheduledAt)}</p>{booking.childProfile && <p className="mt-1 text-xs font-bold text-[#114B33]">For {booking.childProfile.name}</p>}</div>
              </div>
              <div className="sm:text-right">
                <p className="font-black">{money(booking.totalAmount, booking.currency)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#8A7968]">{booking.status} · {booking.paymentStatus}</p>
                {booking.status === "AWAITING_PAYMENT" && booking.paymentStatus !== "PAID" && (
                  <Link
                    href={`/learner/checkout/${booking.id}`}
                    className="mt-3 inline-flex rounded-xl bg-[#114B33] px-4 py-2 text-xs font-black text-white"
                  >
                    Pay now
                  </Link>
                )}
              </div>
            </div>
          </div>)}</div>}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#E8DECE] bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Your learning</p><h2 className="mt-2 text-xl font-black">Help your child get started</h2>
            {data.learner.currentLevel ? <><p className="mt-4 rounded-xl bg-[#FFF8ED] p-4 font-black text-[#114B33]">{data.learner.currentLevel.name}</p>{data.learner.currentLevel.description && <p className="mt-3 text-sm leading-6 text-[#6B5B4B]">{data.learner.currentLevel.description}</p>}</> :
              <p className="mt-4 text-sm leading-6 text-[#6B5B4B]">Add a child profile, then use the Yoruba Challenge to understand where they are starting from.</p>}
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
