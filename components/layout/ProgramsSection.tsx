"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function ProgramsSection() {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen width on mount & resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const programs = [
    {
      age: "Ages 5–7",
      title: "Little Explorers",
      description:
        "Laying visual foundations. Friendly greetings, vibrant color names, animals, family roles, and catchy nursery songs. High visual and play-focused interaction.",
      badgeBg: "bg-[#E6ECE8]",
      badgeText: "text-[#154734]",
      borderColor: "border-[#154734]",
      accentColor: "text-[#154734]",
    },
    {
      age: "Ages 8–10",
      title: "Young Speakers",
      description:
        "Fostering interactive dialogue. Engaging conversation flow, folktales (Àlọ́), basic reading practice, and craft activities representing historical Yoruba kingdoms.",
      badgeBg: "bg-[#FCEEE9]",
      badgeText: "text-[#C05638]",
      borderColor: "border-[#C05638]",
      accentColor: "text-[#C05638]",
    },
    {
      age: "Ages 11–12",
      title: "Heritage Builders",
      description:
        "Deepening linguistic fluency. Complex proverbs (Òwe), ancient history overview, writing, and custom ancestral lineage family tree research projects.",
      badgeBg: "bg-[#FEF6E6]",
      badgeText: "text-[#D9A74A]",
      borderColor: "border-[#D9A74A]",
      accentColor: "text-[#D9A74A]",
    },
  ];

  // Stagger sequence active only on mobile
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isMobile ? 0.2 : 0,
      },
    },
  };

  // Dynamic variants based on screen size
  const cardVariants: Variants = {
    hidden: isMobile
      ? { opacity: 0, x: -50 }
      : { opacity: 1, x: 0 },
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
      id="programs" 
      className="bg-[#FFF8ED] px-6 lg:px-16 py-16 lg:py-24 font-sans overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center space-y-4">
        
        {/* Section Tag */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#D97706] uppercase">
          TAILORED CURRICULUM
        </p>

        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-4xl mx-auto">
          Programs for Every Level
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#55665E] max-w-2xl mx-auto pt-1">
          Every child moves at their own speed. Our age-appropriate levels match cognitive development with cultural discovery.
        </p>

        {/* Animated 3-Column Programs Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-12 text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {programs.map((program, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`h-full bg-[#FFFDF9] rounded-[28px] p-6 lg:p-8 border-2 ${program.borderColor} shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 cursor-pointer`}
            >
              <div className="space-y-6">
                {/* Age Pill Badge */}
                <div className="flex">
                  <span
                    className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${program.badgeBg} ${program.badgeText}`}
                  >
                    {program.age}
                  </span>
                </div>

                {/* Program Title & Description */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-[#1A2621]">
                    {program.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#55665E] leading-relaxed">
                    {program.description}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-8">
                <Link
                  href="#trial"
                  className={`inline-flex items-center gap-2 font-bold text-sm ${program.accentColor} hover:underline group`}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}