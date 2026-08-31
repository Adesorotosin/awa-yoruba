"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function HowItWorksSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const steps = [
    {
      number: "1",
      title: "Book a Free Trial",
      description:
        "Schedule a 30-minute introductory session. We assess your child's starting level, personality, and ideal learning style.",
    },
    {
      number: "2",
      title: "Learn with Native Tutors",
      description:
        "Delightful live 1-on-1 sessions with background-checked Yoruba tutors. Loaded with warm conversation, songs, stories, and interactive games.",
    },
    {
      number: "3",
      title: "Watch Them Flourish",
      description:
        "Track milestones weekly via our simple parent dashboard. Witness your child step into their identity with joy and pride.",
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isMobile ? 0.2 : 0,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: isMobile ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0.5 : 0,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <section 
      id="how-it-works" 
      className="bg-[#FFFFFF] px-6 lg:px-16 py-16 lg:py-24 font-sans overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center space-y-4">
        
        {/* Section Tag */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#D97706] uppercase">
          SIMPLE & INTUITIVE
        </p>

        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-4xl mx-auto">
          How AWA YORUBA Works
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#55665E] max-w-2xl mx-auto pt-1">
          We make cultural learning as natural as breathing. Designed to seamlessly fit into active modern schedules.
        </p>

        {/* 3-Column Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 pb-12 text-left items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              className="h-full bg-[#FFFDF9] rounded-[28px] p-8 lg:p-10 border border-[#EBE3D5] shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Step Number */}
                <span className="text-5xl font-extrabold text-[#D9A74A] leading-none block">
                  {step.number}
                </span>

                {/* Step Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-[#1A2621]">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#55665E] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Button */}
        <div className="pt-4">
          <Link
            href="#trial"
            className="inline-block bg-[#114B33] hover:bg-[#0B3524] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-base"
          >
            Start Your Free Trial
          </Link>
        </div>

      </div>
    </section>
  );
}