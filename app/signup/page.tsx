"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(event:React.FormEvent){
    event.preventDefault(); setLoading(true); setError("");
    try{
      const response=await fetch("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error ?? "Unable to create account.");
      window.location.href="/tutors";
    }catch(err){setError(err instanceof Error?err.message:"Unable to create account.");}finally{setLoading(false);}
  }

  return <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#241C16]">
    <div className="mx-auto max-w-md">
      <Link href="/" className="text-sm font-bold text-[#114B33]">← AWA Yoruba</Link>
      <div className="mt-8 rounded-3xl border border-[#E8DECE] bg-white p-7 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Start learning</p>
        <h1 className="mt-3 text-3xl font-black">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-[#6B5B4B]">Find tutors, book lessons and manage your Yoruba learning journey.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold">Full name<input value={name} onChange={e=>setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]" /></label>
          <label className="block text-sm font-bold">Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]" /></label>
          <label className="block text-sm font-bold">Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={8} required className="mt-2 w-full rounded-xl border border-[#DCCFBD] px-4 py-3 outline-none focus:border-[#114B33]" /><span className="mt-1 block text-xs font-normal text-[#777B75]">Use at least 8 characters.</span></label>
          <button disabled={loading} className="w-full rounded-xl bg-[#114B33] px-4 py-3.5 font-black text-white disabled:opacity-50">{loading?"Creating account...":"Create account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#6B5B4B]">Already have an account? <Link href="/login" className="font-black text-[#114B33]">Log in</Link></p>
      </div>
    </div>
  </main>;
}
