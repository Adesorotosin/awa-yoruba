"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:React.FormEvent){
    event.preventDefault(); setLoading(true); setError("");
    try{
      const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error ?? "Unable to log in.");
      window.location.href = data.user.role === "TUTOR" ? "/tutor/dashboard" : data.user.role === "LEARNER" ? "/learner/dashboard" : "/admin";
    }catch(err){setError(err instanceof Error?err.message:"Unable to log in.");}finally{setLoading(false);}
  }

  return <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#241C16]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="text-sm font-bold text-[#114B33]">← AWA Yoruba</Link>
      <div className="mt-8 rounded-3xl border border-[#E8DECE] bg-white p-7 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Welcome back</p>
        <h1 className="mt-3 text-3xl font-black">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-[#6B5B4B]">Access your AWA Yoruba account.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold">Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]" /></label>
          <label className="block text-sm font-bold">Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]" /></label>
          <button disabled={loading} className="w-full rounded-xl bg-[#114B33] px-4 py-3.5 font-black text-white disabled:opacity-50">{loading?"Logging in...":"Log in"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#6B5B4B]">New to AWA Yoruba? <Link href="/signup" className="font-black text-[#114B33]">Create an account</Link></p>
      </div>
    </div>
  </main>;
}
