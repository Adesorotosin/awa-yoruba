"use client";

import { useState } from "react";
import Link from "next/link";

export default function TutorPasswordPage() {
  const [key,setKey]=useState("");
  const [tutorId,setTutorId]=useState("");
  const [password,setPasswordValue]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:React.FormEvent){
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try{
      const response=await fetch("/api/admin/tutor-password",{method:"POST",headers:{"Content-Type":"application/json","x-admin-key":key},body:JSON.stringify({tutorProfileId:tutorId,password})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error ?? "Unable to set password.");
      setMessage(data.message);
      setPasswordValue("");
    }catch(err){setError(err instanceof Error?err.message:"Unable to set password.");}finally{setLoading(false);}
  }

  return <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#241E17]">
    <div className="mx-auto max-w-md">
      <Link href="/admin/tutors" className="text-sm font-bold text-[#114B33]">← Admin</Link>
      <div className="mt-6 rounded-3xl border border-[#E8DECE] bg-white p-7 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Development only</p>
        <h1 className="mt-3 text-2xl font-black">Set tutor login password</h1>
        <p className="mt-2 text-sm leading-6 text-[#6B655B]">Use this once for tutors created before password-based login was added.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold">Admin key<input type="password" value={key} onChange={e=>setKey(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3" /></label>
          <label className="block text-sm font-bold">Tutor profile ID<input value={tutorId} onChange={e=>setTutorId(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3" placeholder="cmuy..." /></label>
          <label className="block text-sm font-bold">New password<input type="password" minLength={8} value={password} onChange={e=>setPasswordValue(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3" /></label>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-[#114B33] px-4 py-3 font-black text-white disabled:opacity-50">{loading?"Saving...":"Set password"}</button>
        </form>
      </div>
    </div>
  </main>;
}
