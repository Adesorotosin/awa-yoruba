"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  LogOut,
  Star,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Booking = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  priceAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  notes: string | null;
  learner: { name: string | null; email: string | null };
  learnerProfile: { displayName: string | null } | null;
  childProfile: { name: string } | null;
};

type DashboardData = {
  tutor: {
    id: string;
    userId: string;
    displayName: string | null;
    bio: string | null;
    hourlyRate: number | null;
    currency: string;
    applicationStatus: string;
    verificationStatus: string;
    isPublished: boolean;
    averageRating: number;
    totalReviews: number;
  };
  availability: Availability[];
  bookings: Booking[];
  stats: {
    pendingBookings: number;
    upcomingBookings: number;
    completedLessons: number;
  };
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatBookingDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function learnerName(booking: Booking) {
  return booking.childProfile?.name ?? booking.learnerProfile?.displayName ?? booking.learner.name ?? "Learner";
}

export default function TutorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    try {
      setError("");
      const response = await fetch("/api/tutor/dashboard");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to load dashboard.");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function updateBooking(bookingId: string, action: "confirm" | "reject" | "complete") {
    setActionId(bookingId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/tutor/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to update booking.");

      setMessage(result.message);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update booking.");
    } finally {
      setActionId("");
    }
  }

  const pendingBookings = useMemo(
    () => data?.bookings.filter((booking) => booking.status === "PENDING") ?? [],
    [data],
  );

  const upcomingBookings = useMemo(
    () => data?.bookings.filter((booking) => booking.status === "CONFIRMED") ?? [],
    [data],
  );

  if (loading) {
    return <main className="min-h-screen bg-[#FFF8ED] p-8 text-center text-[#17231E]">Loading tutor dashboard...</main>;
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] px-5 py-12 text-[#17231E]">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#E4DBCD] bg-white p-8 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-[#114B33]" />
          <h1 className="mt-4 text-2xl font-black">Tutor dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
          <Link href="/tutors" className="mt-6 inline-flex rounded-full bg-[#114B33] px-5 py-3 text-sm font-black text-white">Browse tutors</Link>
        </div>
      </main>
    );
  }

  const statusLabel = data.tutor.isPublished ? "Published & verified" : data.tutor.applicationStatus;

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">AWA Yoruba</p>
            <h1 className="mt-1 text-xl font-black">Tutor dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/tutors/${data.tutor.id}`} className="hidden rounded-full border border-[#D7CCBD] px-4 py-2 text-sm font-bold text-[#114B33] sm:inline-flex">
              View public profile
            </Link>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-[#114B33] px-4 py-2 text-sm font-bold text-white">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold text-[#B07B22]">Welcome back</p>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl">{data.tutor.displayName ?? "Tutor"}</h2>
            <p className="mt-2 text-sm text-[#6C716B]">Manage your lessons, availability and learner requests from one place.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#BFD6C6] bg-[#EFF5EF] px-4 py-2 text-sm font-black text-[#114B33]">
            <CheckCircle2 className="h-4 w-4" /> {statusLabel}
          </div>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-6 rounded-2xl border border-[#C7DCCB] bg-[#EFF5EF] p-4 text-sm font-bold text-[#114B33]">{message}</div>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Clock3 className="h-5 w-5" />} label="Pending requests" value={data.stats.pendingBookings} />
          <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Upcoming lessons" value={data.stats.upcomingBookings} />
          <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Completed lessons" value={data.stats.completedLessons} />
          <StatCard icon={<Star className="h-5 w-5" />} label="Rating" value={data.tutor.totalReviews ? data.tutor.averageRating.toFixed(1) : "New"} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Action needed</p>
                <h3 className="mt-2 text-xl font-black">Pending booking requests</h3>
              </div>
              <span className="rounded-full bg-[#FFF5DF] px-3 py-1 text-xs font-black text-[#8A621C]">{pendingBookings.length}</span>
            </div>

            {pendingBookings.length ? (
              <div className="mt-5 space-y-4">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    actionId={actionId}
                    onAction={updateBooking}
                    pending
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No pending requests" text="New learner booking requests will appear here." />
            )}
          </section>

          <section className="rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#114B33]" />
              <div>
                <h3 className="font-black">Your availability</h3>
                <p className="text-xs text-[#777B75]">Africa/Lagos</p>
              </div>
            </div>

            {data.availability.length ? (
              <div className="mt-5 space-y-3">
                {data.availability.map((slot) => (
                  <div key={slot.id} className="rounded-2xl bg-[#FFF8ED] p-3">
                    <p className="text-sm font-black">{dayNames[slot.dayOfWeek]}</p>
                    <p className="mt-1 text-sm text-[#5F665F]">{slot.startTime} – {slot.endTime}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No availability" text="Add times so learners can request lessons." />
            )}

            <Link href="/tutor/availability" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#CFC3B2] px-4 py-3 text-sm font-black text-[#114B33]">
              Manage availability
            </Link>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Schedule</p>
              <h3 className="mt-2 text-xl font-black">Upcoming confirmed lessons</h3>
            </div>
            <Users className="h-5 w-5 text-[#114B33]" />
          </div>

          {upcomingBookings.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} actionId={actionId} onAction={updateBooking} />
              ))}
            </div>
          ) : (
            <EmptyState title="No confirmed lessons yet" text="Once you confirm a request, it will appear on your schedule." />
          )}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink href="/tutor/profile" icon={<UserRound className="h-5 w-5" />} title="Edit profile" text="Update your photo, bio, rate and teaching details." />
          <QuickLink href="/tutor/availability" icon={<CalendarDays className="h-5 w-5" />} title="Availability" text="Set when learners can book you." />
          <QuickLink href={`/tutors/${data.tutor.id}`} icon={<ExternalLink className="h-5 w-5" />} title="Public profile" text="See what learners currently see." />
          <QuickLink href="/challenge" icon={<GraduationCap className="h-5 w-5" />} title="Yoruba Challenge" text="Try the learner acquisition experience." />
        </section>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#E4DBCD] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[#114B33]">{icon}</span>
        <span className="text-2xl font-black">{value}</span>
      </div>
      <p className="mt-3 text-sm font-bold text-[#777B75]">{label}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#D8CBB9] bg-[#FFFDF9] p-5">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#777B75]">{text}</p>
    </div>
  );
}

function BookingCard({
  booking,
  actionId,
  onAction,
  pending = false,
}: {
  booking: Booking;
  actionId: string;
  onAction: (bookingId: string, action: "confirm" | "reject" | "complete") => void;
  pending?: boolean;
}) {
  const busy = actionId === booking.id;

  return (
    <article className="rounded-2xl border border-[#E7DED0] bg-[#FFFDF9] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-black">{learnerName(booking)}</p>
          <p className="mt-1 text-sm text-[#777B75]">{booking.learner.email ?? "No email"}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${booking.status === "PENDING" ? "bg-[#FFF1D2] text-[#8A621C]" : "bg-[#EFF5EF] text-[#114B33]"}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-[#5F665F] sm:grid-cols-2">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#114B33]" />{formatBookingDate(booking.scheduledAt)}</div>
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#114B33]" />{booking.durationMinutes} minutes</div>
      </div>

      {booking.notes && <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-6 text-[#5F665F]">“{booking.notes}”</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {pending ? (
          <>
            <button disabled={busy} onClick={() => onAction(booking.id, "confirm")} className="inline-flex items-center gap-2 rounded-xl bg-[#114B33] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" /> {busy ? "Updating..." : "Confirm"}
            </button>
            <button disabled={busy} onClick={() => onAction(booking.id, "reject")} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-700 disabled:opacity-50">
              <XCircle className="h-4 w-4" /> Decline
            </button>
          </>
        ) : (
          <button disabled={busy} onClick={() => onAction(booking.id, "complete")} className="inline-flex items-center gap-2 rounded-xl border border-[#CFC3B2] px-4 py-2.5 text-sm font-black text-[#114B33] disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" /> {busy ? "Updating..." : "Mark completed"}
          </button>
        )}
        <Link href="/tutors" className="inline-flex items-center gap-2 rounded-xl border border-[#CFC3B2] px-4 py-2.5 text-sm font-bold text-[#114B33]">
          <ExternalLink className="h-4 w-4" /> Profile
        </Link>
      </div>
    </article>
  );
}


function QuickLink({
  href,
  icon,
  title,
  text: description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF5EF] text-[#114B33]">
          {icon}
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#777B75]">{description}</p>
      <span className="mt-4 inline-flex text-sm font-black text-[#114B33] group-hover:underline">
        Open
      </span>
    </Link>
  );
}

