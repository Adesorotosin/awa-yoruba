"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  const badgeText = "YORUBA FOR DIASPORA KIDS (AGES 5–12)";

  // Motion variants for character-by-character typewriter effect
  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035, // Speed per character
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline" },
  };

  // Smooth scroll handler for anchor links
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);

    if (elem) {
      elem.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="bg-[#FFF8ED] px-6 lg:px-16 py-12 lg:py-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Badge with Typewriter Effect */}
          <div className="inline-flex items-center gap-2 bg-[#F3ECE0] text-[#154734] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide border border-[#EBE0CF]">
            {/* SVG Nigerian Flag */}
            <svg
              className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0 shadow-xs border border-black/10"
              viewBox="0 0 3 2"
              aria-hidden="true"
            >
              <rect width="1" height="2" x="0" fill="#008751" />
              <rect width="1" height="2" x="1" fill="#FFFFFF" />
              <rect width="1" height="2" x="2" fill="#008751" />
            </svg>

            {/* Staggered Animated Text */}
            <motion.span
              variants={sentenceVariants}
              initial="hidden"
              animate="visible"
            >
              {badgeText.split("").map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#1A2621] leading-[1.14] tracking-tight">
            Help Your Child Speak Yoruba — And Stay Connected to Where They Come From
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#55665E] max-w-xl leading-relaxed">
            Fun, structured Yoruba lessons through conversation, stories, songs, games, culture and family activities. Created specifically for families raising global citizens.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#trial"
              onClick={(e) => handleScroll(e, "#trial")}
              className="bg-[#114B33] hover:bg-[#0B3524] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-base cursor-pointer"
            >
              Book a Free Trial
            </a>
            <a
              href="#programs"
              onClick={(e) => handleScroll(e, "#programs")}
              className="bg-transparent hover:bg-[#114B33]/5 text-[#114B33] font-semibold px-8 py-4 rounded-full border border-[#114B33] transition-all duration-200 text-base cursor-pointer"
            >
              Explore the Program
            </a>
          </div>

          {/* Social Proof / Trust Badge with Staggered Bounce */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex -space-x-2 overflow-hidden py-1">
              <div className="animate-bounce [animation-delay:-0.3s] z-30 inline-flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-[#FAF7F0] bg-[#154734] text-white text-xs font-bold">
                AO
              </div>
              <div className="animate-bounce [animation-delay:-0.15s] z-20 inline-flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-[#FAF7F0] bg-[#D9A74A] text-[#154734] text-xs font-bold">
                KA
              </div>
              <div className="animate-bounce z-10 inline-flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-[#FAF7F0] bg-[#3B2570] text-white text-xs font-bold">
                TE
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#55665E]">
              Joined by <span className="font-bold text-[#3B2570]">500+ diaspora families</span> globally
            </p>
          </div>

        </div>

        {/* Right Column: Hero Visual with Fill */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          
          {/* Ambient Warm Shadow behind frame */}
          <div className="absolute inset-0 bg-[#E8D9C0]/50 blur-2xl rounded-[40px] transform scale-95 -z-10" />

          {/* Image Container with Fill */}
          <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[4/3.2] rounded-[36px] overflow-hidden shadow-xl border-4 border-white/80">
            <Image
              src="/hero-image.jpg"
              alt="Kid learning Yoruba online with headphones"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
          </div>

        </div>

      </div>
    </section>
  );
}