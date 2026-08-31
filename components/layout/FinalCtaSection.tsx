import Link from "next/link";

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0D3B29] px-6 lg:px-16 py-20 lg:py-32 text-center text-white font-sans">
      
      {/* Background Decorative Circles */}
      <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
          Don’t Let Distance Silence Your Language
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#D0E0D8] max-w-2xl mx-auto leading-relaxed">
          Give your child the lifelong gift of Yoruba conversation, pride, and family connection — one beautiful conversation at a time.
        </p>

        {/* Action Buttons Container */}
        <div className="pt-4 space-y-4 flex flex-col items-center">
          
          {/* Primary Gold CTA */}
          <Link
            href="#trial"
            className="inline-block bg-[#E5B252] hover:bg-[#D9A74A] text-[#1A2621] font-bold px-9 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-base"
          >
            Book Your Free Trial Today
          </Link>

          {/* Secondary Link */}
          <Link
            href="#programs"
            className="inline-block text-sm text-[#E0ECE6] hover:text-white underline underline-offset-4 transition-colors duration-200 font-medium pt-2"
          >
            Or explore our customizable programs &rarr;
          </Link>

        </div>

      </div>
    </section>
  );
}