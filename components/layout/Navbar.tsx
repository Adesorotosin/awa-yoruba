"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Find a Tutor", href: "/tutors" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Yoruba Challenge", href: "/challenge" },
    { label: "For Tutors", href: "/#for-tutors" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8DECE] bg-[#FFF8ED]/95 px-5 py-3 backdrop-blur-md sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#114B33] text-sm font-black text-white">À</div>
          <div>
            <div className="text-base font-black tracking-wide text-[#114B33]">AWA YORUBA</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A806F]">Learn · Speak · Belong</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#3C473F] lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#114B33]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden px-3 py-2.5 text-sm font-semibold text-[#114B33] sm:inline-flex">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-[#114B33] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0B3524] sm:px-5">Get started</Link>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
            className="rounded-xl p-2 text-[#114B33] hover:bg-[#F5EAD7] lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 border-t border-[#E8DECE] pb-2 pt-4 lg:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#3C473F] hover:bg-[#F5EAD7] hover:text-[#114B33]">
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="mt-2 rounded-xl px-3 py-3 text-sm font-semibold text-[#114B33] hover:bg-[#F5EAD7]">Sign in</Link>
        </nav>
      )}
    </header>
  );
}
