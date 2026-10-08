import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Globe2, ShieldCheck, Star } from "lucide-react";
import { db } from "@/lib/db";

function splitList(value: string | null) {
  return (value ?? "")
    .split(/[,·]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tutor = await db.tutorProfile.findFirst({
    where: {
      id,
      isPublished: true,
      applicationStatus: "APPROVED",
      verificationStatus: "VERIFIED",
    },
    include: {
      user: true,
      availability: {
        where: { isActive: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!tutor) notFound();

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const specialties = splitList(tutor.specialties);
  const languages = splitList(tutor.languages);

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/tutors" className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]">
            <ArrowLeft className="h-4 w-4" />
            Back to tutors
          </Link>
          <Link href="/tutor/apply" className="rounded-full bg-[#114B33] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0B3524]">
            Become a tutor
          </Link>
        </div>
      </header>

      <section className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-3xl bg-[#EAF0EA]">
              {tutor.photoUrl ? (
                <Image
                  src={tutor.photoUrl}
                  alt={tutor.displayName ?? "Yoruba tutor"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-[#114B33]/35">
                  {(tutor.displayName ?? "YT").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF5EF] px-3 py-1.5 text-xs font-black text-[#114B33]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified tutor
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6DF] px-3 py-1.5 text-xs font-black text-[#8A641B]">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {tutor.averageRating.toFixed(1)} ({tutor.totalReviews} reviews)
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                {tutor.displayName ?? "Yoruba Tutor"}
              </h1>
              <p className="mt-2 text-sm text-[#697069]">
                {tutor.experienceYears ?? 0} years of teaching experience
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCCFBD] bg-[#FFF8ED] p-5 lg:min-w-[220px]">
              <p className="text-xs text-[#8B8E87]">Lesson rate</p>
              <p className="mt-1 text-2xl font-black text-[#114B33]">
                ₦{(tutor.hourlyRate ?? 0).toLocaleString()}
                <span className="text-sm font-semibold text-[#777B75]"> / hour</span>
              </p>
              <Link
                href={`/tutors/${tutor.id}/book`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#114B33] px-4 py-3 text-sm font-black text-white hover:bg-[#0B3524]"
              >
                <CalendarDays className="h-4 w-4" />
                Book a lesson
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12 lg:py-16">
        <div className="space-y-6">
          <article className="rounded-3xl border border-[#E4DBCD] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black">About this tutor</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#5F665F]">
              {tutor.bio ?? "This tutor is ready to help you build confidence in Yoruba."}
            </p>
          </article>

          <article className="rounded-3xl border border-[#E4DBCD] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black">Teaching specialties</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {specialties.length ? specialties.map((item) => (
                <span key={item} className="rounded-full bg-[#EFF5EF] px-4 py-2 text-sm font-bold text-[#315541]">
                  {item}
                </span>
              )) : <p className="text-sm text-[#777B75]">Yoruba language and conversation</p>}
            </div>
          </article>

          <article className="rounded-3xl border border-[#E4DBCD] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black">Qualifications & background</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#5F665F]">
              {tutor.qualifications ?? "Teaching background provided during tutor verification."}
            </p>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#E4DBCD] bg-white p-6">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-[#114B33]" />
              <h2 className="font-black">Languages</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.length ? languages.map((item) => (
                <span key={item} className="rounded-full bg-[#F5EAD7] px-3 py-1.5 text-xs font-bold text-[#655238]">
                  {item}
                </span>
              )) : <span className="text-sm text-[#777B75]">Yoruba</span>}
            </div>
          </div>

          <div className="rounded-3xl border border-[#E4DBCD] bg-white p-6">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#114B33]" />
              <h2 className="font-black">Availability</h2>
            </div>

            {tutor.availability.length ? (
              <div className="mt-4 space-y-3">
                {tutor.availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#FFF8ED] px-3 py-2.5 text-sm">
                    <span className="font-bold">{dayNames[slot.dayOfWeek] ?? "Day"}</span>
                    <span className="text-[#697069]">{slot.startTime} – {slot.endTime}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[#777B75]">
                This tutor has not published availability yet. Booking availability will appear here when set.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-[#D7C39C] bg-[#F5EAD7] p-6">
            <p className="text-sm font-black text-[#17231E]">Ready to learn?</p>
            <p className="mt-2 text-sm leading-6 text-[#6C604E]">
              Choose a lesson time that works for you and continue to secure booking.
            </p>
            <Link
              href={`/tutors/${tutor.id}/book`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#114B33] px-4 py-3 text-sm font-black text-white hover:bg-[#0B3524]"
            >
              Continue to booking
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
