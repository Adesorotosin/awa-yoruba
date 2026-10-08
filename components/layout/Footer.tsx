import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#171717] px-5 py-12 text-[#A3A3A3] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-lg font-black tracking-wide text-white">AWA YORUBA</Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#8E8E8E]">
              A marketplace connecting Yoruba learners with tutors who help them learn, speak and belong.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Explore</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/tutors" className="hover:text-white">Find a Tutor</Link>
              <Link href="/#how-it-works" className="hover:text-white">How It Works</Link>
              <Link href="/challenge" className="hover:text-white">Yoruba Challenge</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">For Tutors</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/tutor/apply" className="hover:text-white">Become a Tutor</Link>
              <Link href="/login" className="hover:text-white">Sign in</Link>
              <Link href="/signup" className="hover:text-white">Create account</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-[#292929] pt-6 text-xs text-[#737373]">
          © {new Date().getFullYear()} ÀWA YORÙBÁ. Learn · Speak · Belong.
        </div>
      </div>
    </footer>
  );
}
