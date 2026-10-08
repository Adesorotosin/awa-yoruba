"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  ShieldCheck,
  Star,
  WalletCards,
} from "lucide-react";

const tutors = [
  {
    name: "Yoruba Tutor",
    initials: "YT",
    rating: "4.9",
    lessons: "120+ lessons",
    rate: "₦8,500",
    specialty: "Conversation · Culture",
  },
  {
    name: "Native Yoruba Coach",
    initials: "NY",
    rating: "5.0",
    lessons: "85+ lessons",
    rate: "₦10,000",
    specialty: "Beginners · Children",
  },
  {
    name: "Yoruba Language Tutor",
    initials: "YL",
    rating: "4.8",
    lessons: "60+ lessons",
    rate: "₦7,500",
    specialty: "Adults · Fluency",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Real Yoruba tutors",
    text: "Learn from tutors who understand the language, culture and everyday Yoruba conversation.",
  },
  {
    icon: CalendarDays,
    title: "Learn on your schedule",
    text: "Choose a tutor and lesson time that fits your routine, wherever you are in the world.",
  },
  {
    icon: WalletCards,
    title: "Simple, secure payments",
    text: "Pay through AWA Yoruba and keep your bookings, credits and lesson history in one place.",
  },
  {
    icon: Globe2,
    title: "For learners everywhere",
    text: "Whether you are in Lagos, London, Houston or anywhere else, Yoruba is always within reach.",
  },
];

const steps = [
  ["01", "Discover", "Browse tutors by experience, price, rating and availability."],
  ["02", "Choose", "Open a tutor profile, compare their teaching style and pick the right fit."],
  ["03", "Book & pay", "Select a convenient time and complete your booking securely."],
  ["04", "Learn & grow", "Meet your tutor, build your Yoruba and progress through learning levels."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8ED] text-[#17231E]">
      <header className="border-b border-[#E8DECE] bg-[#FFF8ED]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#114B33] text-sm font-black text-white">
              À
            </div>
            <div>
              <div className="text-base font-black tracking-wide text-[#114B33]">AWA YORUBA</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A806F]">Learn · Speak · Belong</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#3C473F] lg:flex">
            <a href="#tutors" className="transition hover:text-[#114B33]">Find a Tutor</a>
            <a href="#how-it-works" className="transition hover:text-[#114B33]">How It Works</a>
            <a href="#challenge" className="transition hover:text-[#114B33]">Yoruba Challenge</a>
            <a href="#for-tutors" className="transition hover:text-[#114B33]">For Tutors</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#114B33] sm:inline-flex">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full bg-[#114B33] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B3524] sm:px-5">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="overflow-hidden border-b border-[#E8DECE]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#D8C9B2] bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#114B33]">
              <span className="h-2 w-2 rounded-full bg-[#E5B252]" />
              The Yoruba learning marketplace
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#17231E] sm:text-6xl lg:text-7xl">
              Learn Yoruba from people who speak it.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5D625D] sm:text-xl">
              Find the right Yoruba tutor, book one-on-one lessons, pay securely and learn at your own pace — wherever you are.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#tutors" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#114B33] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0B3524]">
                Find a Yoruba tutor <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#challenge" className="inline-flex items-center justify-center rounded-full border border-[#B9AB96] bg-white px-6 py-3.5 text-sm font-bold text-[#114B33] transition hover:bg-[#F5EAD7]">
                Test your Yoruba
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#666A64]">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#114B33]" /> Flexible lessons</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#114B33]" /> Verified tutors</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#114B33]" /> Secure checkout</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-[#E5B252]/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-[#114B33]/10 blur-3xl" />

            <div className="relative w-full max-w-md rounded-[2rem] border border-[#DED2C1] bg-white p-5 shadow-[0_25px_70px_rgba(36,47,40,0.12)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#938978]">Find your fit</p>
                  <h2 className="mt-1 text-xl font-black text-[#17231E]">Yoruba tutors</h2>
                </div>
                <span className="rounded-full bg-[#EFF5EF] px-3 py-1.5 text-xs font-bold text-[#114B33]">Live marketplace</span>
              </div>

              <div className="space-y-3">
                {tutors.map((tutor) => (
                  <div key={tutor.name} className="rounded-2xl border border-[#E9E2D7] p-4 transition hover:border-[#B8C8BC] hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#114B33] text-xs font-black text-white">
                        {tutor.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#17231E]">{tutor.name}</p>
                        <p className="mt-1 text-xs text-[#767A74]">{tutor.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 text-sm font-bold"><Star className="h-3.5 w-3.5 fill-current text-[#D89B2B]" />{tutor.rating}</p>
                        <p className="mt-1 text-xs font-semibold text-[#767A74]">{tutor.rate}/hr</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#85887F]">
                      <span>{tutor.lessons}</span>
                      <span className="flex items-center gap-1 font-semibold text-[#114B33]"><Clock3 className="h-3.5 w-3.5" /> Check availability</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E8DECE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF5EF] text-[#114B33]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-[#17231E]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#696E68]">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Simple by design</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[#17231E] sm:text-5xl">From discovery to your first conversation.</h2>
            <p className="mt-5 text-lg leading-8 text-[#666B65]">AWA Yoruba brings the pieces together so finding and booking a Yoruba tutor does not feel complicated.</p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[#DDD2C1] bg-[#DDD2C1] md:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, text]) => (
              <div key={number} className="bg-[#FFF8ED] p-7">
                <span className="text-sm font-black text-[#B07B22]">{number}</span>
                <h3 className="mt-8 text-xl font-black text-[#17231E]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#686D67]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="challenge" className="scroll-mt-20 border-y border-[#D7C39C] bg-[#114B33] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E5B252]">A little challenge</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Think you know Yoruba?</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#D8E4DC] sm:text-lg">
              Take a quick 10-question Yoruba challenge. Do well and earn learning credit toward your AWA Yoruba lessons.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#BFD0C4]">One welcome attempt. No endless reward farming.</p>
          </div>
          <a href="/challenge" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#114B33] transition hover:bg-[#F5EAD7]">
            Take the challenge <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="tutors" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Meet your next tutor</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[#17231E] sm:text-5xl">Choose someone who fits how you learn.</h2>
            </div>
            <a href="/tutors" className="inline-flex items-center gap-2 text-sm font-black text-[#114B33]">Browse all tutors <ArrowRight className="h-4 w-4" /></a>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {tutors.map((tutor) => (
              <article key={tutor.name} className="rounded-3xl border border-[#E4DBCD] bg-[#FFFDF9] p-5 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-32 items-end rounded-2xl bg-[#EAF0EA] p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#114B33] text-sm font-black text-white">{tutor.initials}</div>
                </div>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-[#17231E]">{tutor.name}</h3>
                    <p className="mt-1 text-sm text-[#777B75]">{tutor.specialty}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-3.5 w-3.5 fill-current text-[#D89B2B]" /> {tutor.rating}</span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#ECE5DB] pt-4">
                  <div>
                    <p className="text-xs text-[#8B8E87]">Starting from</p>
                    <p className="mt-1 font-black text-[#114B33]">{tutor.rate}<span className="text-xs font-semibold text-[#777B75]"> / hour</span></p>
                  </div>
                  <a href="/tutors" className="rounded-full bg-[#EFF5EF] px-4 py-2 text-xs font-black text-[#114B33]">View profile</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="for-tutors" className="scroll-mt-20 border-t border-[#E8DECE]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">For Yoruba speakers & teachers</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[#17231E] sm:text-5xl">Turn your Yoruba knowledge into meaningful work.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#666B65]">
              Create a tutor profile, set your price and availability, meet learners and earn from teaching Yoruba through AWA Yoruba.
            </p>
            <Link href="/tutor/apply" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#114B33] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B3524]">
              Become a tutor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[2rem] border border-[#DCCFBC] bg-[#F5EAD7] p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#114B33]"><WalletCards className="h-5 w-5" /></div>
              <h3 className="font-black text-[#17231E]">Your teaching business, in one place.</h3>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Profile & verification", "Availability & bookings", "Earnings & wallet", "Reviews & lesson history"].map((item) => (
                <div key={item} className="rounded-xl bg-white/70 p-4 text-sm font-bold text-[#3C463F]">
                  <CheckCircle2 className="mb-2 h-4 w-4 text-[#114B33]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5EAD7]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 lg:py-24">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B07B22]">Start learning</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[#17231E] sm:text-6xl">Your next Yoruba conversation starts here.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#666B65]">Find a tutor who fits your goals, schedule your first lesson and start building a stronger connection with Yoruba.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#tutors" className="rounded-full bg-[#114B33] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#0B3524]">Find your tutor</a>
            <Link href="/signup" className="rounded-full border border-[#B8A990] bg-white px-7 py-3.5 text-sm font-black text-[#114B33]">Create an account</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#171717] px-5 py-12 text-[#A3A3A3] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <div className="text-lg font-black tracking-wide text-white">AWA YORUBA</div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#8E8E8E]">A marketplace connecting Yoruba learners with tutors who can help them learn, speak and belong.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3">
              <a href="#tutors" className="hover:text-white">Find a Tutor</a>
              <a href="#how-it-works" className="hover:text-white">How It Works</a>
              <a href="#challenge" className="hover:text-white">Yoruba Challenge</a>
              <a href="#for-tutors" className="hover:text-white">Become a Tutor</a>
              <Link href="/login" className="hover:text-white">Sign in</Link>
              <Link href="/signup" className="hover:text-white">Get started</Link>
            </div>
          </div>
          <div className="mt-10 border-t border-[#292929] pt-6 text-xs text-[#737373]">© {new Date().getFullYear()} ÀWA YORÙBÁ. Learn · Speak · Belong.</div>
        </div>
      </footer>
    </main>
  );
}
