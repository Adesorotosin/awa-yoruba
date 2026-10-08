"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Trophy } from "lucide-react";

type Option = { id: string; optionText: string };
type Question = { id: string; questionText: string; audioUrl: string | null; order: number; options: Option[] };
type Challenge = { id: string; title: string; description: string | null; maxRewardAmount: number; currency: string; questions: Question[] };
type Attempt = { id: string; score: number; totalQuestions: number; rewardAmount: number; status: string; completedAt: string };

export default function ChallengePage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ score: number; totalQuestions: number; rewardAmount: number } | null>(null);

  useEffect(() => {
    async function loadChallenge() {
      try {
        const response = await fetch("/api/challenges/welcome", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load the challenge.");
        if (!data.available) { setExistingAttempt(data.attempt); return; }
        setChallenge(data.challenge);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load the challenge.");
      } finally { setLoading(false); }
    }
    loadChallenge();
  }, []);

  const question = challenge?.questions[current];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function selectAnswer(optionId: string) {
    if (!question || submitting) return;
    setAnswers((previous) => ({ ...previous, [question.id]: optionId }));
    setError("");
  }

  function nextQuestion() {
    if (!question || !answers[question.id]) { setError("Choose an answer before continuing."); return; }
    setError("");
    setCurrent((value) => Math.min(value + 1, (challenge?.questions.length ?? 1) - 1));
  }

  function previousQuestion() {
    setError("");
    setCurrent((value) => Math.max(value - 1, 0));
  }

  async function submitChallenge() {
    if (!challenge || !question) return;
    if (!answers[question.id]) { setError("Choose an answer before submitting."); return; }
    if (answeredCount !== challenge.questions.length) { setError("Please answer every question before submitting."); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/challenges/welcome/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          answers: challenge.questions.map((item) => ({ questionId: item.id, selectedOptionId: answers[item.id] })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "ALREADY_COMPLETED" && data.attempt) { setExistingAttempt(data.attempt); setChallenge(null); return; }
        throw new Error(data.error || "Unable to submit the challenge.");
      }
      setResult({ score: data.score, totalQuestions: data.totalQuestions, rewardAmount: data.rewardAmount });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the challenge.");
    } finally { setSubmitting(false); }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] text-[#17231E]"><div className="flex items-center gap-3 font-semibold text-[#114B33]"><Loader2 className="h-5 w-5 animate-spin" /> Loading the Yoruba Challenge...</div></main>;

  if (error && !challenge && !existingAttempt) return <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] px-5 text-center text-[#17231E]"><div><p className="font-bold text-red-700">{error}</p><Link href="/" className="mt-5 inline-flex rounded-full bg-[#114B33] px-5 py-3 text-sm font-bold text-white">Back home</Link></div></main>;

  if (existingAttempt) return (
    <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#17231E]">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#DED2C1] bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF5EF] text-[#114B33]"><CheckCircle2 className="h-8 w-8" /></div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Challenge completed</p>
        <h1 className="mt-3 text-4xl font-black">You have already taken this challenge.</h1>
        <p className="mt-4 text-[#666B65]">Your welcome attempt is limited to one try.</p>
        <div className="mt-8 rounded-2xl bg-[#FFF8ED] p-6"><p className="text-sm font-semibold text-[#777B75]">Your score</p><p className="mt-1 text-5xl font-black text-[#114B33]">{existingAttempt.score}/{existingAttempt.totalQuestions}</p>{existingAttempt.rewardAmount > 0 && <p className="mt-3 font-bold text-[#B07B22]">₦{existingAttempt.rewardAmount.toLocaleString()} learning credit earned</p>}</div>
        <Link href="/tutors" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#114B33] px-6 py-3.5 text-sm font-bold text-white">Find a Yoruba tutor <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </main>
  );

  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    return <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#17231E]"><div className="mx-auto max-w-2xl rounded-[2rem] border border-[#DED2C1] bg-white p-8 text-center shadow-xl sm:p-12"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF2D6] text-[#B07B22]"><Trophy className="h-8 w-8" /></div><p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Challenge complete</p><h1 className="mt-3 text-4xl font-black">You scored {result.score}/{result.totalQuestions}</h1><p className="mt-3 text-lg text-[#666B65]">{percentage}% correct. Nice work.</p>{result.rewardAmount > 0 ? <div className="mt-8 rounded-2xl bg-[#EFF5EF] p-6"><p className="text-sm font-semibold text-[#657066]">Your learning credit</p><p className="mt-1 text-4xl font-black text-[#114B33]">₦{result.rewardAmount.toLocaleString()}</p><p className="mt-2 text-sm text-[#657066]">Create your AWA Yoruba account to claim this credit. It will be applied automatically at checkout toward an eligible lesson.</p></div> : <div className="mt-8 rounded-2xl bg-[#FFF8ED] p-6 text-sm leading-6 text-[#666B65]">You completed the challenge. Keep learning and come back when you are ready for an advancement challenge.</div>}<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="rounded-full bg-[#114B33] px-6 py-3.5 text-sm font-bold text-white">Create your account</Link><Link href="/tutors" className="rounded-full border border-[#B9AB96] bg-white px-6 py-3.5 text-sm font-bold text-[#114B33]">Browse tutors</Link></div></div></main>;
  }

  if (!challenge || !question) return null;
  const isLast = current === challenge.questions.length - 1;
  const selected = answers[question.id];
  const progress = ((current + 1) / challenge.questions.length) * 100;

  return <main className="min-h-screen bg-[#FFF8ED] px-5 py-10 text-[#17231E] sm:py-16"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#114B33]"><ArrowLeft className="h-4 w-4" /> Back home</Link><div className="mt-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Test Your Yoruba</p><h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">{challenge.title}</h1><p className="mt-4 max-w-2xl text-[#666B65]">{challenge.description}</p></div><div className="mt-8 h-2 overflow-hidden rounded-full bg-[#E4DBCD]"><div className="h-full rounded-full bg-[#114B33] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex justify-between text-xs font-bold text-[#777B75]"><span>Question {current + 1} of {challenge.questions.length}</span><span>{answeredCount}/{challenge.questions.length} answered</span></div><section className="mt-6 rounded-[2rem] border border-[#DED2C1] bg-white p-6 shadow-[0_20px_60px_rgba(36,47,40,0.08)] sm:p-10"><p className="text-sm font-bold text-[#B07B22]">Question {current + 1}</p><h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">{question.questionText}</h2><div className="mt-8 grid gap-3">{question.options.map((option, index) => { const active = selected === option.id; return <button key={option.id} type="button" onClick={() => selectAnswer(option.id)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? "border-[#114B33] bg-[#EFF5EF] text-[#114B33]" : "border-[#E4DBCD] bg-white hover:border-[#B8C8BC] hover:bg-[#FFF8ED]"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${active ? "bg-[#114B33] text-white" : "bg-[#F1ECE3] text-[#666B65]"}`}>{String.fromCharCode(65 + index)}</span><span className="font-semibold">{option.optionText}</span></button>; })}</div>{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<div className="mt-8 flex items-center justify-between gap-3"><button type="button" onClick={previousQuestion} disabled={current === 0 || submitting} className="inline-flex items-center gap-2 rounded-full border border-[#B9AB96] px-5 py-3 text-sm font-bold text-[#114B33] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Previous</button>{isLast ? <button type="button" onClick={submitChallenge} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#114B33] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}{submitting ? "Submitting..." : "Finish challenge"}</button> : <button type="button" onClick={nextQuestion} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#114B33] px-6 py-3 text-sm font-bold text-white">Next <ArrowRight className="h-4 w-4" /></button>}</div></section></div></main>;
}
