"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, MapPin } from "lucide-react";

type Resource = {
  resource: { id: string; title: string; slug: string; summary: string; resourceType: string; difficulty: string; ageMin: number | null; ageMax: number | null };
  isPrimary: boolean;
  note: string | null;
};
type Dialect = { name: string; slug: string; summary: string; region: string | null; description: string | null; resources: Resource[] };

export default function DialectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [dialect, setDialect] = useState<Dialect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.slug) return;
    let active = true;
    fetch(`/api/dialects/${encodeURIComponent(params.slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load this entry.");
        if (active) setDialect(data.dialect);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load this entry.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.slug]);

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-black text-[#114B33]">ÀWA YORÙBÁ</Link>
          <Link href="/library" className="text-sm font-bold text-[#114B33]">Cultural library <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-20">
        <Link href="/dialects" className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]"><ArrowLeft className="h-4 w-4" />All varieties</Link>
        {loading ? <div className="mt-8 h-64 animate-pulse rounded-3xl bg-white" /> : error ? (
          <div role="alert" className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">{error}<p className="mt-4"><Link href="/dialects" className="font-bold underline">Return to the catalogue</Link></p></div>
        ) : dialect ? (
          <>
            <div className="mt-8 rounded-3xl border border-[#E3D8C7] bg-white p-7 sm:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF5EF] text-[#114B33]"><BookOpen className="h-6 w-6" /></div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Regional language and culture</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">{dialect.name}</h1>
              {dialect.region && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#777B75]"><MapPin className="h-4 w-4" />{dialect.region}</p>}
              <p className="mt-6 text-lg leading-8 text-[#555F57]">{dialect.summary}</p>
              {dialect.description && <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#666B65]">{dialect.description}</div>}
              <p className="mt-7 border-t border-[#EEE7DD] pt-5 text-xs leading-6 text-[#777B75]">Language and cultural descriptions can vary by community. We welcome review and contributions from knowledgeable speakers.</p>
            </div>
            <section className="mt-12">
              <h2 className="text-2xl font-black">Learning resources</h2>
              <p className="mt-2 text-sm text-[#777B75]">{dialect.resources.length} published resources linked to this entry</p>
              {dialect.resources.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-[#E3D8C7] bg-white p-7 text-sm leading-7 text-[#666B65]">Resources for this variety are being collected and reviewed. Check the <Link href="/library" className="font-bold text-[#114B33] underline">cultural library</Link> for other published material.</div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {dialect.resources.map(({ resource, note }) => (
                    <Link key={resource.id} href={`/library/${resource.slug}`} className="rounded-2xl border border-[#E3D8C7] bg-white p-6 transition hover:border-[#B8C8BC] hover:shadow-md">
                      <p className="text-xs font-black uppercase tracking-wider text-[#B07B22]">{resource.resourceType.replaceAll("_", " ")} · {resource.difficulty}</p>
                      <h3 className="mt-3 text-lg font-black">{resource.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#666B65]">{resource.summary}</p>
                      {note && <p className="mt-3 text-xs italic text-[#777B75]">{note}</p>}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#114B33]">Open resource <ArrowRight className="h-4 w-4" /></span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
