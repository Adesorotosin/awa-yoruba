"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Star, Clock3, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Tutor = {
  id: string;
  displayName: string | null;
  bio: string | null;
  photoUrl: string | null;
  experienceYears: number | null;
  languages: string | null;
  specialties: string | null;
  hourlyRate: number | null;
  averageRating: number;
  totalReviews: number;
};

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTutors(query = "") {
    setLoading(true);
    setError("");
    try {
      const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
      const response = await fetch(`/api/tutors${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load tutors.");
      setTutors(data.tutors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tutors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadTutors(); }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadTutors(search);
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="shrink-0">
            <Image src="/logo.svg" alt="ÀWA YORÙBÁ" width={77} height={68} className="h-12 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/challenge" className="hidden text-sm font-bold text-[#114B33] sm:block">Yoruba Challenge</Link>
            <Link href="/tutor/apply" className="rounded-full bg-[#114B33] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0B3524]">Become a tutor</Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[#E8DECE]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Yoruba tutor marketplace</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Find a tutor who fits how you want to learn.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#666B65]">Compare verified Yoruba tutors, explore their teaching strengths and choose someone who fits your goals.</p>
          <form onSubmit={handleSearch} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#D8CCBB] bg-white px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 shrink-0 text-[#8A8175]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversation, children, beginners, culture..." className="w-full bg-transparent text-sm outline-none placeholder:text-[#9B9388]" />
            </div>
            <button type="submit" className="rounded-2xl bg-[#114B33] px-6 py-3 text-sm font-black text-white hover:bg-[#0B3524]">Search tutors</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Verified tutors</h2>
            <p className="mt-1 text-sm text-[#777B75]">{loading ? "Finding tutors..." : `${tutors.length} tutor${tutors.length === 1 ? "" : "s"} available`}</p>
          </div>
          <div className="hidden items-center gap-2 text-sm font-semibold text-[#5F685F] sm:flex"><ShieldCheck className="h-4 w-4 text-[#114B33]" />Profiles are reviewed before publishing</div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-white" />)}</div>
        ) : tutors.length === 0 ? (
          <div className="rounded-3xl border border-[#E3D8C7] bg-white p-12 text-center">
            <h3 className="text-xl font-black">No tutors found yet.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777B75]">Try a different search, or check back as more verified tutors join AWA Yoruba.</p>
            <Link href="/tutor/apply" className="mt-6 inline-flex rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white">Become the first tutor</Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <article key={tutor.id} className="overflow-hidden rounded-3xl border border-[#E4DBCD] bg-white transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-44 bg-[#EAF0EA]">
                  {tutor.photoUrl ? (
                    <Image src={tutor.photoUrl} alt={tutor.displayName ?? "Yoruba tutor"} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-black text-[#114B33]/30">{(tutor.displayName ?? "YT").slice(0,2).toUpperCase()}</div>
                  )}
                  <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#114B33] shadow-sm"><ShieldCheck className="h-3.5 w-3.5" />Verified</span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{tutor.displayName ?? "Yoruba Tutor"}</h3>
                      <p className="mt-1 text-sm text-[#777B75]">{tutor.experienceYears ?? 0} years experience</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-[#FFF6DF] px-2.5 py-1 text-xs font-black text-[#8A641B]"><Star className="h-3.5 w-3.5 fill-current" />{tutor.averageRating.toFixed(1)}</span>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5F665F]">{tutor.bio ?? "A Yoruba tutor ready to help you build confidence in the language."}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tutor.specialties?.split(/[,·]/).map((item) => item.trim()).filter(Boolean).slice(0,3).map((item) => (
                      <span key={item} className="rounded-full bg-[#EFF5EF] px-3 py-1.5 text-xs font-bold text-[#315541]">{item}</span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-[#EEE7DD] pt-4">
                    <div>
                      <p className="text-xs text-[#8B8E87]">From</p>
                      <p className="mt-1 text-lg font-black text-[#114B33]">₦{(tutor.hourlyRate ?? 0).toLocaleString()}<span className="text-xs font-semibold text-[#777B75]"> / hour</span></p>
                    </div>
                    <Link href={`/tutors/${tutor.id}`} className="inline-flex items-center gap-1 rounded-full bg-[#114B33] px-4 py-2.5 text-xs font-black text-white hover:bg-[#0B3524]">View profile <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#81867F]"><Clock3 className="h-3.5 w-3.5" />Open profile to view availability.</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
