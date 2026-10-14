"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, MapPin, Sparkles } from "lucide-react";

type Dialect = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  region: string | null;
  _count: { resources: number };
};

export default function DialectsPage() {
  const [dialects, setDialects] = useState<Dialect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/dialects")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load dialects.");
        if (active) setDialects(data.dialects ?? []);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load dialects.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-black tracking-tight text-[#114B33]">ÀWA YORÙBÁ</Link>
          <Link href="/library" className="text-sm font-bold text-[#114B33] hover:underline">Cultural library <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
      </header>

      <section className="border-b border-[#E8DECE]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]"><Sparkles className="h-4 w-4" /> Language, place and identity</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Discover the many voices of Yorùbá.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#666B65]">Explore regional varieties, the communities connected to them, and the stories and expressions that help families pass their heritage to the next generation.</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#777B75]">Regional varieties are living forms of language. Names, pronunciation and descriptions should be reviewed with speakers and community contributors—not treated as rigid boundaries.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-7">
          <h2 className="text-2xl font-black">Explore varieties</h2>
          <p className="mt-2 text-sm text-[#777B75]">{loading ? "Loading the catalogue…" : `${dialects.length} published ${dialects.length === 1 ? "entry" : "entries"}`}</p>
        </div>

        {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-3xl bg-white" />)}</div>
        ) : !error && dialects.length === 0 ? (
          <div className="rounded-3xl border border-[#E3D8C7] bg-white p-8 sm:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF5EF] text-[#114B33]"><BookOpen className="h-6 w-6" /></div>
            <h3 className="mt-5 text-xl font-black">The first community-reviewed entries are being prepared.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#666B65]">We are building this catalogue carefully so regional names, pronunciation and cultural context are represented respectfully. Published entries will appear here after review.</p>
            <Link href="/library" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3524]">Visit the cultural library <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {dialects.map((dialect) => (
              <Link key={dialect.id} href={`/dialects/${dialect.slug}`} className="group rounded-3xl border border-[#E3D8C7] bg-white p-6 transition hover:-translate-y-1 hover:border-[#B8C8BC] hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF5EF] text-[#114B33]"><BookOpen className="h-6 w-6" /></div>
                  <span className="rounded-full bg-[#FFF6DF] px-3 py-1.5 text-xs font-bold text-[#8A641B]">{dialect._count.resources} resources</span>
                </div>
                <h3 className="mt-5 text-xl font-black group-hover:text-[#114B33]">{dialect.name}</h3>
                {dialect.region && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#777B75]"><MapPin className="h-3.5 w-3.5" />{dialect.region}</p>}
                <p className="mt-3 text-sm leading-6 text-[#666B65]">{dialect.summary}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#114B33]">Explore entry <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
