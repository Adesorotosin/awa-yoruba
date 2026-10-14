"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Headphones } from "lucide-react";

type Resource = {
  title: string; slug: string; summary: string; resourceType: string; originalText: string | null;
  translation: string | null; transcript: string | null; audioUrl: string | null; imageUrl: string | null;
  ageMin: number | null; ageMax: number | null; difficulty: string; contributorName: string | null;
  sourceName: string | null; sourceUrl: string | null; reviewedBy: string | null; reviewedAt: string | null;
  dialects: { isPrimary: boolean; note: string | null; dialect: { name: string; slug: string; region: string | null } }[];
};

export default function CulturalResourcePage() {
  const params = useParams<{ slug: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.slug) return;
    let active = true;
    fetch(`/api/library/${encodeURIComponent(params.slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load this resource.");
        if (active) setResource(data.resource);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load this resource.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.slug]);

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-black text-[#114B33]">ÀWA YORÙBÁ</Link>
          <Link href="/dialects" className="text-sm font-bold text-[#114B33]">Explore varieties</Link>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-20">
        <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]"><ArrowLeft className="h-4 w-4" />Back to library</Link>
        {loading ? <div className="mt-8 h-80 animate-pulse rounded-3xl bg-white" /> : error ? (
          <div role="alert" className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">{error}<p className="mt-4"><Link href="/library" className="font-bold underline">Return to the library</Link></p></div>
        ) : resource ? (
          <article className="mt-8 overflow-hidden rounded-3xl border border-[#E3D8C7] bg-white">
            {resource.imageUrl && <img src={resource.imageUrl} alt="" className="max-h-[26rem] w-full object-cover" />}
            <div className="p-7 sm:p-12">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">{resource.resourceType.replaceAll("_", " ")} · {resource.difficulty}</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{resource.title}</h1>
              <p className="mt-5 text-lg leading-8 text-[#666B65]">{resource.summary}</p>
              {resource.dialects.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{resource.dialects.map(({ dialect, isPrimary }) => <Link key={dialect.slug} href={`/dialects/${dialect.slug}`} className="rounded-full bg-[#EFF5EF] px-3 py-1.5 text-xs font-bold text-[#315541] hover:underline">{dialect.name}{isPrimary ? " · primary variety" : ""}</Link>)}</div>}
              {(resource.ageMin !== null || resource.ageMax !== null) && <p className="mt-4 text-xs text-[#777B75]">Suggested age: {resource.ageMin ?? "Any"}–{resource.ageMax ?? "Any"}</p>}
              {resource.audioUrl && <div className="mt-8 rounded-2xl bg-[#EFF5EF] p-5"><p className="mb-3 flex items-center gap-2 text-sm font-black text-[#114B33]"><Headphones className="h-4 w-4" />Listen</p><audio controls preload="none" className="w-full" src={resource.audioUrl}>Your browser does not support audio playback.</audio></div>}
              {resource.originalText && <section className="mt-8"><h2 className="text-lg font-black">Yorùbá</h2><div className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#FFF8ED] p-5 text-base leading-8">{resource.originalText}</div></section>}
              {resource.translation && <section className="mt-6"><h2 className="text-lg font-black">English meaning</h2><div className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#F7F7F1] p-5 text-base leading-8 text-[#555F57]">{resource.translation}</div></section>}
              {resource.transcript && <section className="mt-6"><h2 className="text-lg font-black">Transcript and notes</h2><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#555F57]">{resource.transcript}</div></section>}
              {(resource.contributorName || resource.sourceName || resource.reviewedBy) && <footer className="mt-10 border-t border-[#EEE7DD] pt-5 text-xs leading-6 text-[#777B75]">
                {resource.contributorName && <p>Contributor: {resource.contributorName}</p>}
                {resource.sourceName && <p>Source: {resource.sourceUrl ? <a href={resource.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#114B33] underline">{resource.sourceName}</a> : resource.sourceName}</p>}
                {resource.reviewedBy && <p>Language/cultural review: {resource.reviewedBy}{resource.reviewedAt ? ` · ${new Date(resource.reviewedAt).toLocaleDateString()}` : ""}</p>}
              </footer>}
              <div className="mt-8 flex items-center gap-2 text-xs leading-6 text-[#777B75]"><BookOpen className="h-4 w-4 shrink-0" />If you spot a spelling, pronunciation or attribution issue, this resource should be reviewed before it is used in a lesson.</div>
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
