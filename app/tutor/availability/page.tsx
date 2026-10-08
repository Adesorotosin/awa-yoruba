"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Pencil, Plus, Trash2 } from "lucide-react";

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
};

type Tutor = {
  id: string;
  displayName: string | null;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TutorAvailabilityPage() {
  const [tutorId, setTutorId] = useState("");
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCurrentTutor();
  }, []);

  async function loadCurrentTutor() {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (!response.ok || data.user?.role !== "TUTOR" || !data.user?.tutorProfileId) {
        throw new Error("Please log in as an approved tutor.");
      }
      setTutorId(data.user.tutorProfileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to identify your tutor account.");
      setLoading(false);
    }
  }

  async function loadAvailability(id = tutorId) {
    if (!id) {
      setLoading(false);
      setError("Please log in as a tutor to manage your availability.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tutors/availability?tutorId=" + encodeURIComponent(id));
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Unable to load availability.");

      setTutor(data.tutor);
      setAvailability(data.availability);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load availability.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tutorId) void loadAvailability(tutorId);
  }, [tutorId]);

  const groupedAvailability = useMemo(
    () =>
      days.map((name, index) => ({
        name,
        index,
        slots: availability.filter((slot) => slot.dayOfWeek === index),
      })),
    [availability],
  );

  function resetForm() {
    setEditingId(null);
    setDayOfWeek("1");
    setStartTime("09:00");
    setEndTime("17:00");
  }

  function editSlot(slot: Availability) {
    setEditingId(slot.id);
    setDayOfWeek(String(slot.dayOfWeek));
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveAvailability(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/tutors/availability", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          availabilityId: editingId,
          dayOfWeek: Number(dayOfWeek),
          startTime,
          endTime,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save availability.");

      setMessage(data.message);
      resetForm();
      await loadAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(id: string) {
    if (!window.confirm("Remove this availability period? Future booking slots from this period will no longer be offered.")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/tutors/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, availabilityId: id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to remove availability.");

      setMessage(data.message);
      if (editingId === id) resetForm();
      await loadAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove availability.");
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-[#FFF8ED] p-8 text-center text-[#17231E]">Loading availability...</main>;
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-4 sm:px-8">
          <Link href="/tutors" className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]">
            <ArrowLeft className="h-4 w-4" /> Back to tutors
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Tutor workspace</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {tutor ? tutor.displayName ?? "Tutor" : "Tutor"} availability
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#666B65]">
            Set the weekly periods when learners can request 60-minute Yoruba lessons. All booking times use Africa/Lagos.
          </p>
        </div>

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#CFE0D3] bg-[#EFF5EF] p-4 text-sm font-semibold text-[#114B33]">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={saveAvailability} className="rounded-3xl border border-[#E4DBCD] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#114B33]" />
              <h2 className="font-black">{editingId ? "Edit availability" : "Add availability"}</h2>
            </div>

            <label className="mt-6 block text-sm font-bold">
              Day
              <select value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)} className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none focus:border-[#114B33]">
                {days.map((day, index) => <option key={day} value={index}>{day}</option>)}
              </select>
            </label>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-sm font-bold">
                Start
                <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-3 py-3 outline-none focus:border-[#114B33]" />
              </label>
              <label className="text-sm font-bold">
                End
                <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-3 py-3 outline-none focus:border-[#114B33]" />
              </label>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#F7F3EA] p-3 text-xs leading-5 text-[#666B65]">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#114B33]" />
              Each availability period is split into 60-minute booking slots.
            </div>

            <div className="mt-6 flex gap-3">
              <button disabled={saving || !tutorId} type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#114B33] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60">
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Save changes" : "Add period"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-xl border border-[#DCCFBD] px-4 py-3 text-sm font-bold text-[#114B33]">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            {groupedAvailability.map((group) => (
              <div key={group.index} className="rounded-3xl border border-[#E4DBCD] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-black">{group.name}</h2>
                  <span className="text-xs font-bold text-[#8A8175]">{group.slots.length} period{group.slots.length === 1 ? "" : "s"}</span>
                </div>

                {group.slots.length ? (
                  <div className="mt-4 space-y-3">
                    {group.slots.map((slot) => (
                      <div key={slot.id} className="flex flex-col gap-3 rounded-2xl border border-[#EEE5D8] bg-[#FFFDF9] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</p>
                          <p className="mt-1 text-xs text-[#8A8175]">{slot.timezone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => editSlot(slot)} className="inline-flex items-center gap-2 rounded-lg border border-[#DCCFBD] px-3 py-2 text-xs font-bold text-[#114B33]">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => void removeSlot(slot.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#8A8175]">No availability published for this day.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
