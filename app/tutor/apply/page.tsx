import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, ShieldCheck, Users } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Reach learners",
    text: "Connect with people actively looking for Yoruba tutors.",
  },
  {
    icon: ShieldCheck,
    title: "Build trust",
    text: "Show your experience, specialties and teaching background.",
  },
  {
    icon: Clock3,
    title: "Teach on your schedule",
    text: "Set your availability and decide when you are available for lessons.",
  },
];

export default function TutorApplyPage() {
  return (
    <main className="min-h-screen bg-[#FFF8ED] px-5 pb-16 pt-28 text-[#241C16] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#6B5B4B] transition hover:text-[#241C16]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <section>
            <span className="inline-flex rounded-full bg-[#EDE5D8] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#6B5B4B]">
              Become a tutor
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Teach Yoruba on AWA Yoruba.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6B5B4B] sm:text-lg">
              Share your language, culture and experience with learners who want to speak Yoruba with confidence.
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 rounded-xl bg-[#E7DCCB] p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#6B5B4B]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E8DECE] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-black">Tutor application</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B5B4B]">
                Tell us about yourself. Applications are reviewed before a tutor profile is published.
              </p>
            </div>

            <form action="/api/tutors/apply" method="POST" className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">Full name</span>
                  <input name="name" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="Your full name" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Email</span>
                  <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="you@example.com" />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">Phone</span>
                  <input name="phone" type="tel" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="+234..." />
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Years of experience</span>
                  <input name="experienceYears" type="number" min="0" max="60" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="e.g. 4" />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold">Yoruba teaching specialties</span>
                <input name="specialties" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="Conversation, children, culture, beginners..." />
              </label>

              <label className="block">
                <span className="text-sm font-bold">Languages you can teach in</span>
                <input name="languages" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="Yoruba, English..." />
              </label>

              <label className="block">
                <span className="text-sm font-bold">Qualifications / teaching background</span>
                <textarea name="qualifications" required rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="Tell us about your education, certifications or teaching experience." />
              </label>

              <label className="block">
                <span className="text-sm font-bold">Short bio</span>
                <textarea name="bio" required rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="Introduce yourself to future learners." />
              </label>

              <label className="block">
                <span className="text-sm font-bold">Hourly rate (NGN)</span>
                <input name="hourlyRate" type="number" min="0" required className="mt-2 w-full rounded-xl border border-[#DCCFBD] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#7655FB]" placeholder="e.g. 8500" />
              </label>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#241C16] px-5 py-3.5 font-bold text-white transition hover:opacity-90">
                Submit application
                <CheckCircle2 className="h-5 w-5" />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
