"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, FileText, LockKeyhole, Plus, RefreshCw } from "lucide-react";

type DialectRecord = {
  id: string; name: string; slug: string; summary: string; region: string | null;
  description: string | null; status: string; reviewedBy: string | null; reviewedAt: string | null;
};
type ResourceRecord = {
  id: string; title: string; slug: string; summary: string; resourceType: string; status: string;
  rightsStatus: string; consentRecorded: boolean; reviewedBy: string | null; reviewedAt: string | null;
  dialects: { dialect: { id: string; name: string; slug: string } }[];
};

export default function AdminCulturalLibraryPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [dialects, setDialects] = useState<DialectRecord[]>([]);
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/cultural-library", { headers: { "x-admin-key": key } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load the cultural library.");
      setAdminKey(key);
      setDialects(data.dialects ?? []);
      setResources(data.resources ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load the cultural library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedKey = window.sessionStorage.getItem("awa-admin-key");
    if (savedKey) {
      setKeyInput(savedKey);
      void loadRecords(savedKey);
    }
  }, [loadRecords]);

  async function createRecord(event: React.FormEvent<HTMLFormElement>, kind: "dialect" | "resource") {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body: Record<string, unknown> = Object.fromEntries(formData.entries());
    body.kind = kind;
    if (kind === "resource") {
      body.dialectIds = formData.getAll("dialectIds").map(String);
      body.consentRecorded = formData.get("consentRecorded") === "on";
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/cultural-library", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save this draft.");
      form.reset();
      setMessage(kind === "dialect" ? "Dialect draft saved. Review it before publishing." : "Resource draft saved. Confirm rights and review before publishing.");
      await loadRecords(adminKey);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this draft.");
      setLoading(false);
    }
  }

  async function changeStatus(kind: "dialect" | "resource", id: string, currentStatus: string) {
    const status = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const reviewedBy = status === "PUBLISHED" ? window.prompt("Name of the language/cultural reviewer:")?.trim() ?? "" : "";
    if (status === "PUBLISHED" && !reviewedBy) {
      setError("Publishing cancelled. Enter a reviewer name to publish.");
      return;
    }
    if (!window.confirm(status === "PUBLISHED" ? "Publish this reviewed entry for the public catalogue?" : "Unpublish this entry and return it to draft status?")) return;

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/cultural-library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ kind, id, status, reviewedBy }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update publication status.");
      setMessage(status === "PUBLISHED" ? "Entry published." : "Entry returned to draft.");
      await loadRecords(adminKey);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update publication status.");
      setLoading(false);
    }
  }

  function unlockAdmin() {
    const key = keyInput.trim();
    if (!key) {
      setError("Enter your admin key.");
      return;
    }
    window.sessionStorage.setItem("awa-admin-key", key);
    void loadRecords(key);
  }

  function signOutAdmin() {
    window.sessionStorage.removeItem("awa-admin-key");
    setAdminKey("");
    setKeyInput("");
    setDialects([]);
    setResources([]);
    setMessage("");
    setError("");
  }

  if (!adminKey) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#17231E]">
        <div className="mx-auto max-w-md rounded-3xl border border-[#E8DECE] bg-white p-8 shadow-sm">
          <LockKeyhole className="h-8 w-8 text-[#114B33]" />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">AWA Yoruba Admin</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Cultural library editor</h1>
          <p className="mt-3 text-sm leading-6 text-[#6E655B]">Enter the admin key configured as <code>ADMIN_KEY</code> for this environment.</p>
          <input type="password" value={keyInput} onChange={(event) => setKeyInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") unlockAdmin(); }} placeholder="Admin key" className="mt-6 w-full rounded-2xl border border-[#DCCFBD] bg-[#FFFCF7] px-4 py-3 outline-none focus:border-[#114B33]" />
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="button" onClick={unlockAdmin} disabled={loading} className="mt-4 w-full rounded-2xl bg-[#114B33] px-4 py-3 font-bold text-white transition hover:bg-[#0B3524] disabled:opacity-60">{loading ? "Checking…" : "Open editor"}</button>
          <Link href="/" className="mt-5 inline-flex text-sm font-bold text-[#114B33]"><ArrowLeft className="mr-2 h-4 w-4" />Back to AWA Yoruba</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-5 py-10 text-[#17231E] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]"><ArrowLeft className="h-4 w-4" />AWA Yoruba</Link>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Cultural library editor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666B65]">Create draft entries, check community context and publication rights, then publish only after review. Drafts stay hidden from public pages.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void loadRecords(adminKey)} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#D8CCBB] bg-white px-4 py-2.5 text-sm font-bold text-[#114B33]"><RefreshCw className="h-4 w-4" />Refresh</button>
            <button type="button" onClick={signOutAdmin} className="rounded-full border border-[#D8CCBB] px-4 py-2.5 text-sm font-bold text-[#555F57]">Sign out</button>
          </div>
        </div>

        {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div role="status" className="mt-6 flex items-center gap-2 rounded-2xl border border-[#B8C8BC] bg-[#EFF5EF] p-4 text-sm font-semibold text-[#114B33]"><CheckCircle2 className="h-4 w-4" />{message}</div>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={(event) => void createRecord(event, "dialect")} className="rounded-3xl border border-[#E3D8C7] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF5EF] text-[#114B33]"><BookOpen className="h-5 w-5" /></div><div><h2 className="text-xl font-black">Add a dialect entry</h2><p className="text-xs text-[#777B75]">Always starts as a draft</p></div></div>
            <div className="mt-6 grid gap-4">
              <label className="text-sm font-bold">Name<input name="name" required maxLength={100} placeholder="e.g. Ijẹ̀ṣà" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
              <label className="text-sm font-bold">URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="e.g. ijesa" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /><span className="mt-1 block text-xs font-normal text-[#777B75]">Lowercase letters, numbers and hyphens only.</span></label>
              <label className="text-sm font-bold">Short summary<textarea name="summary" required rows={3} maxLength={600} placeholder="A careful, community-informed introduction…" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
              <label className="text-sm font-bold">Region or community context<input name="region" maxLength={160} placeholder="Optional; verify before publishing" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
              <label className="text-sm font-bold">Long description<textarea name="description" rows={4} maxLength={5000} placeholder="Context, usage notes, pronunciation notes…" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
            </div>
            <button type="submit" disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Plus className="h-4 w-4" />Save dialect draft</button>
          </form>

          <form onSubmit={(event) => void createRecord(event, "resource")} className="rounded-3xl border border-[#E3D8C7] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF6DF] text-[#8A641B]"><FileText className="h-5 w-5" /></div><div><h2 className="text-xl font-black">Add a cultural resource</h2><p className="text-xs text-[#777B75]">Rights and consent required to publish</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold sm:col-span-2">Title<input name="title" required maxLength={180} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
              <label className="text-sm font-bold">URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
              <label className="text-sm font-bold">Resource type<select name="resourceType" defaultValue="STORY" className="mt-2 w-full rounded-xl border border-[#D8CCBB] bg-white px-3 py-2.5 font-normal"><option value="STORY">Story</option><option value="PROVERB">Proverb</option><option value="SONG">Song</option><option value="VOCABULARY">Vocabulary</option><option value="CONVERSATION">Conversation</option><option value="AUDIO">Audio</option></select></label>
              <label className="text-sm font-bold sm:col-span-2">Short summary<textarea name="summary" required rows={2} maxLength={600} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal outline-none focus:border-[#114B33]" /></label>
              <label className="text-sm font-bold">Difficulty<select name="difficulty" defaultValue="BEGINNER" className="mt-2 w-full rounded-xl border border-[#D8CCBB] bg-white px-3 py-2.5 font-normal"><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option><option>ALL_LEVELS</option></select></label>
              <div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Min age<input name="ageMin" type="number" min="0" max="18" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold">Max age<input name="ageMax" type="number" min="0" max="18" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label></div>
              <label className="text-sm font-bold sm:col-span-2">Yoruba text<input name="originalText" maxLength={10000} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">English translation<textarea name="translation" rows={2} maxLength={10000} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">Transcript / learning notes<textarea name="transcript" rows={3} maxLength={15000} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">Audio URL<input name="audioUrl" type="url" placeholder="https://…" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">Image URL<input name="imageUrl" type="url" placeholder="https://…" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <div className="sm:col-span-2"><p className="text-sm font-bold">Link to dialect entries</p>{dialects.length === 0 ? <p className="mt-2 text-xs text-[#777B75]">Create dialect entries first to link a resource.</p> : <div className="mt-2 grid gap-2 sm:grid-cols-2">{dialects.map((dialect) => <label key={dialect.id} className="flex items-center gap-2 rounded-xl border border-[#EEE7DD] p-3 text-sm"><input type="checkbox" name="dialectIds" value={dialect.id} className="accent-[#114B33]" />{dialect.name}<span className="ml-auto text-[10px] text-[#777B75]">{dialect.status}</span></label>)}</div>}</div>
              <label className="text-sm font-bold">Contributor name<input name="contributorName" maxLength={180} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold">Source name<input name="sourceName" maxLength={180} className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">Source URL<input name="sourceUrl" type="url" placeholder="https://…" className="mt-2 w-full rounded-xl border border-[#D8CCBB] px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">Publication rights<select name="rightsStatus" defaultValue="UNCONFIRMED" className="mt-2 w-full rounded-xl border border-[#D8CCBB] bg-white px-3 py-2.5 font-normal"><option value="UNCONFIRMED">Unconfirmed — cannot publish</option><option value="ORIGINAL">Original work</option><option value="PUBLIC_DOMAIN">Public domain</option><option value="LICENSED">Licensed</option><option value="PERMISSION_GRANTED">Permission granted</option></select></label>
              <label className="flex items-start gap-2 text-sm leading-5 sm:col-span-2"><input name="consentRecorded" type="checkbox" className="mt-1 accent-[#114B33]" />Contributor/performer permission or applicable consent has been recorded.</label>
            </div>
            <button type="submit" disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Plus className="h-4 w-4" />Save resource draft</button>
          </form>
        </div>

        <section className="mt-10 rounded-3xl border border-[#E3D8C7] bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-black">Dialect entries</h2><p className="mt-1 text-sm text-[#777B75]">{dialects.length} total</p></div><BookOpen className="h-6 w-6 text-[#114B33]" /></div>
          <div className="mt-5 divide-y divide-[#EEE7DD]">
            {dialects.length === 0 ? <p className="py-6 text-sm text-[#777B75]">No dialect entries yet. Add a draft above.</p> : dialects.map((dialect) => <div key={dialect.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{dialect.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${dialect.status === "PUBLISHED" ? "bg-[#EFF5EF] text-[#114B33]" : "bg-[#FFF6DF] text-[#8A641B]"}`}>{dialect.status}</span></div><p className="mt-1 text-xs text-[#777B75]">/{dialect.slug}{dialect.region ? ` · ${dialect.region}` : ""}</p><p className="mt-2 text-sm text-[#666B65]">{dialect.summary}</p>{dialect.reviewedBy && <p className="mt-1 text-xs text-[#777B75]">Reviewed by {dialect.reviewedBy}</p>}</div><button type="button" disabled={loading} onClick={() => void changeStatus("dialect", dialect.id, dialect.status)} className="shrink-0 rounded-full border border-[#D8CCBB] px-4 py-2.5 text-xs font-bold text-[#114B33] disabled:opacity-60">{dialect.status === "PUBLISHED" ? "Unpublish" : "Review & publish"}</button></div>)}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#E3D8C7] bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-black">Cultural resources</h2><p className="mt-1 text-sm text-[#777B75]">{resources.length} total</p></div><FileText className="h-6 w-6 text-[#114B33]" /></div>
          <div className="mt-5 divide-y divide-[#EEE7DD]">
            {resources.length === 0 ? <p className="py-6 text-sm text-[#777B75]">No resources yet. Add a draft above.</p> : resources.map((resource) => <div key={resource.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{resource.title}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${resource.status === "PUBLISHED" ? "bg-[#EFF5EF] text-[#114B33]" : "bg-[#FFF6DF] text-[#8A641B]"}`}>{resource.status}</span><span className="rounded-full bg-[#F5F1E9] px-2.5 py-1 text-[10px] font-bold text-[#666B65]">{resource.resourceType}</span></div><p className="mt-1 text-xs text-[#777B75]">/{resource.slug} · rights: {resource.rightsStatus} · consent: {resource.consentRecorded ? "recorded" : "not recorded"}</p><p className="mt-2 text-sm text-[#666B65]">{resource.summary}</p><p className="mt-1 text-xs text-[#777B75]">Dialects: {resource.dialects.map((item) => item.dialect.name).join(", ") || "General / not linked"}</p>{resource.reviewedBy && <p className="mt-1 text-xs text-[#777B75]">Reviewed by {resource.reviewedBy}</p>}</div><button type="button" disabled={loading} onClick={() => void changeStatus("resource", resource.id, resource.status)} className="shrink-0 rounded-full border border-[#D8CCBB] px-4 py-2.5 text-xs font-bold text-[#114B33] disabled:opacity-60">{resource.status === "PUBLISHED" ? "Unpublish" : "Review & publish"}</button></div>)}
          </div>
        </section>
        <p className="mt-6 text-xs leading-6 text-[#777B75]">Publishing records the reviewer and review time. For resources, the API also blocks publication until consent/permission and a recognised rights status are present. Do not upload or publish cultural material unless you have permission to share it.</p>
      </div>
    </main>
  );
}
