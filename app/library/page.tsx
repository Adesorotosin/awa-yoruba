"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Headphones, Search, Sparkles } from "lucide-react";

type Resource = {
  id: string; title: string; slug: string; summary: string; resourceType: string; difficulty: string;
  ageMin: number | null; ageMax: number | null; audioUrl: string | null; imageUrl: string | null;
  dialects: { isPrimary: boolean; dialect: { name: string; slug: string; region: string | null } }[];
};

const types = [
  { label: "Everything", value: "ALL" },
  { label: "Stories", value: "STORY" },
  { label: "Proverbs", value: "PROVERB" },
  { label: "Songs", value: "SONG" },
  { label: "Vocabulary", value: "VOCABULARY" },
  { label: "Conversations", value: "CONVERSATION" },
  { label: "Audio", value: "AUDIO" },
];

export default function CulturalLibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/library?type=${encodeURIComponent(type)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load the library.");
        if (active) setResources(data.resources ?? []);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load the library.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((resource) => [
      resource.title, resource.summary, resource.resourceType,
      ...resource.dialects.map((item) => item.dialect.name),
    ].join(" ").toLowerCase().includes(query));
  }, [resources, search]);

  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-black text-[#114B33]">ÀWA YORÙBÁ</Link>
          <Link href="/dialects" className="text-sm font-bold text-[#114B33]">Explore varieties <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
      </header>
      <section className="border-b border-[#E8DECE]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]"><Sparkles className="h-4 w-4" /> Stories, words and living culture</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">A library for the next generation.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#666B65]">Explore Yoruba stories, proverbs, songs, vocabulary and conversations, with regional context wherever it is known and reviewed.</p>
          <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#D8CCBB] bg-white px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-[#8A8175]" />
            <input aria-label="Search cultural resources" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories, proverbs, or varieties…" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9B9388]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {types.map((item) => (
              <button key={item.value} type="button" onClick={() => setType(item.value)} aria-pressed={type === item.value} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${type === item.value ? "border-[#114B33] bg-[#114B33] text-white" : "border-[#D8CCBB] bg-white text-[#4D5A50] hover:border-[#114B33]"}`}>{item.label}</button>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div><h2 className="text-2xl font-black">Explore the collection</h2><p className="mt-2 text-sm text-[#777B75]">{loading ? "Loading resources…" : `${filtered.length} published ${filtered.length === 1 ? "resource" : "resources"}`}</p></div>
          <BookOpen className="hidden h-8 w-8 text-[#114B33]/40 sm:block" />
        </div>
        {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}
        {loading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white" />)}</div> :
          !error && filtered.length === 0 ? (
            <div className="rounded-3xl border border-[#E3D8C7] bg-white p-8 sm:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF5EF] text-[#114B33]"><Headphones className="h-6 w-6" /></div>
              <h3 className="mt-5 text-xl font-black">{search ? "No resources match that search." : "The first cultural resources are being prepared."}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#666B65]">{search ? "Try another word or choose a different resource type." : "We will publish material only after checking attribution, permission to share, and language or cultural review. That matters especially for children and community stories."}</p>
              {search && <button type="button" onClick={() => setSearch("")} className="mt-5 rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white">Clear search</button>}
              <Link href="/dialects" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#114B33]">Explore regional varieties <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((resource) => (
                <Link key={resource.id} href={`/library/${resource.slug}`} className="group overflow-hidden rounded-3xl border border-[#E3D8C7] bg-white transition hover:-translate-y-1 hover:shadow-lg">
                  {resource.imageUrl ? <div className="h-44 overflow-hidden bg-[#EFF5EF]"><img src={resource.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" /></div> : <div className="flex h-36 items-center justify-center bg-[#EFF5EF] text-[#114B33]"><BookOpen className="h-10 w-10" /></div>}
                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-wider text-[#B07B22]">{resource.resourceType.replaceAll("_", " ")} · {resource.difficulty}</p>
                    <h3 className="mt-3 text-xl font-black group-hover:text-[#114B33]">{resource.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#666B65]">{resource.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{resource.dialects.map(({ dialect }) => <span key={dialect.slug} className="rounded-full bg-[#EFF5EF] px-3 py-1.5 text-xs font-bold text-[#315541]">{dialect.name}</span>)}</div>
                    {(resource.ageMin !== null || resource.ageMax !== null) && <p className="mt-4 text-xs text-[#777B75]">Suggested age: {resource.ageMin ?? "Any"}–{resource.ageMax ?? "Any"}</p>}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#114B33]">Explore resource <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
