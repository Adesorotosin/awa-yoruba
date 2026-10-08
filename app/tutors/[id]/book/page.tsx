"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Tutor = {
  id: string;
  displayName: string | null;
  hourlyRate: number | null;
  availability: Availability[];
};

type BookingResponse = {
  bookingId: string;
  message: string;
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildTimeSlots(startTime: string, endTime: string) {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let minutes = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  while (minutes + 60 <= end) {
    const hour = Math.floor(minutes / 60).toString().padStart(2, "0");
    const minute = (minutes % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    minutes += 60;
  }

  return slots;
}

export default function TutorBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const [tutorId, setTutorId] = useState("");
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [learnerEmail, setLearnerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<BookingResponse | null>(null);

  useEffect(() => {
    void params.then(({ id }) => setTutorId(id));
  }, [params]);

  useEffect(() => {
    if (!tutorId) return;

    async function loadTutor() {
      try {
        const response = await fetch(`/api/tutors/${tutorId}/booking`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load tutor.");
        setTutor(data.tutor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load tutor.");
      } finally {
        setLoading(false);
      }
    }

    void loadTutor();
  }, [tutorId]);

  useEffect(() => {
    async function loadLearner() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.user) {
          window.location.href = `/login?redirect=/tutors/${tutorId}/book`;
          return;
        }

        if (data.user.role !== "LEARNER") {
          setError("Only learner accounts can book a lesson.");
          return;
        }

        setLearnerName(data.user.name ?? "");
        setLearnerEmail(data.user.email ?? "");
      } catch {
        setError("Unable to verify your learner account.");
      }
    }

    if (tutorId) void loadLearner();
  }, [tutorId]);

  const availableDates = useMemo(() => {
    if (!tutor) return [];
    const today = new Date();
    return Array.from({ length: 21 }, (_, index) => addDays(today, index + 1)).filter(
      (day) => tutor.availability.some((slot) => slot.dayOfWeek === day.getDay()),
    );
  }, [tutor]);

  const selectedDay = date ? new Date(`${date}T12:00:00`) : null;
  const selectedAvailability = selectedDay
    ? tutor?.availability.filter((slot) => slot.dayOfWeek === selectedDay.getDay()) ?? []
    : [];

  const timeSlots = selectedAvailability.flatMap((slot) => buildTimeSlots(slot.startTime, slot.endTime));

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(null);

    try {
      const response = await fetch(`/api/tutors/${tutorId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, notes }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create booking.");

      setSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-[#FFF8ED] p-8 text-center text-[#17231E]">Loading booking page...</main>;
  }

  if (error && !tutor) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] p-8 text-center text-[#17231E]">
        <p className="text-red-700">{error}</p>
        <Link href="/tutors" className="mt-5 inline-flex rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white">Back to tutors</Link>
      </main>
    );
  }

  if (!tutor) return null;

  if (success) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] px-5 py-12 text-[#17231E] sm:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#D8CBB9] bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5EF] text-[#114B33]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Booking request received</p>
          <h1 className="mt-3 text-3xl font-black">Your lesson request is in.</h1>
          <p className="mt-4 text-base leading-7 text-[#666B65]">{success.message}</p>
          <p className="mt-3 text-sm text-[#777B75]">Booking reference: {success.bookingId}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/tutors/${tutor.id}`} className="rounded-full border border-[#CFC3B2] px-5 py-3 text-sm font-bold text-[#114B33]">Back to tutor</Link>
            <Link href="/tutors" className="rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white">Browse more tutors</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-4xl items-center px-5 py-4 sm:px-8">
          <Link href={`/tutors/${tutor.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]">
            <ArrowLeft className="h-4 w-4" /> Back to tutor
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={submitBooking} className="rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Book a lesson</p>
            <h1 className="mt-3 text-3xl font-black">Book with {tutor.displayName ?? "this tutor"}.</h1>
            <p className="mt-3 text-sm leading-6 text-[#666B65]">Choose an available time and tell us what you want to learn. Your booking will be attached to your signed-in learner account.</p>

            {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="mt-7 rounded-2xl border border-[#DCCFBD] bg-[#FFF8ED] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Booking as</p>
              <p className="mt-2 font-black text-[#241C16]">{learnerName || "Your learner account"}</p>
              <p className="mt-1 text-sm text-[#6B5B4B]">{learnerEmail || "Signed-in learner"}</p>
            </div>

            <div className="mt-5">
              <label className="text-sm font-bold" htmlFor="date">Choose a date</label>
              <select id="date" value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none focus:border-[#114B33]">
                <option value="">Select an available date</option>
                {availableDates.map((day) => (
                  <option key={formatDate(day)} value={formatDate(day)}>
                    {dayNames[day.getDay()]} · {day.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                  </option>
                ))}
              </select>
              {!availableDates.length && <p className="mt-2 text-sm text-[#8A8175]">This tutor has not published availability yet.</p>}
            </div>

            <div className="mt-5">
              <label className="text-sm font-bold" htmlFor="time">Choose a time</label>
              <select id="time" value={time} onChange={(event) => setTime(event.target.value)} required disabled={!date || !timeSlots.length} className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-[#114B33]">
                <option value="">Select an available time</option>
                {timeSlots.map((slot) => <option key={slot} value={slot}>{slot} (Africa/Lagos)</option>)}
              </select>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-bold">Note for the tutor <span className="font-normal text-[#8A8175]">(optional)</span></span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none focus:border-[#114B33]" placeholder="Tell the tutor what you want to learn..." />
            </label>

            <button disabled={submitting || !availableDates.length || !learnerEmail} type="submit" className="mt-7 w-full rounded-xl bg-[#114B33] px-5 py-3.5 text-sm font-black text-white hover:bg-[#0B3524] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Creating booking..." : "Request this lesson"}
            </button>
          </form>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-[#E4DBCD] bg-white p-6">
              <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-[#114B33]" /><h2 className="font-black">Booking details</h2></div>
              <div className="mt-5 space-y-4 text-sm">
                <div><p className="text-[#8A8175]">Tutor</p><p className="mt-1 font-bold">{tutor.displayName ?? "Yoruba Tutor"}</p></div>
                <div><p className="text-[#8A8175]">Rate</p><p className="mt-1 text-xl font-black text-[#114B33]">₦{(tutor.hourlyRate ?? 0).toLocaleString()} / hour</p></div>
                <div className="flex items-start gap-2 text-[#5F665F]"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#114B33]" /><span>Lessons are currently set to 60 minutes.</span></div>
                <div className="flex items-start gap-2 text-[#5F665F]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#114B33]" /><span>Your request is recorded securely in AWA Yoruba.</span></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
