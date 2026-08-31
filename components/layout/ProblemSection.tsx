"use client";

import { Quote } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function ProblemSection() {
  const painPoints = [
    {
      quote:
        '"I understand Yoruba when my parents speak it, but I can only reply in English."',
      title: "THE SILENT UNDERSTANDING GAP",
      subtitle: "Common for first-generation kids",
    },
    {
      quote:
        '"I want to teach my child, but between school and work, I do not have the structured tools or time."',
      title: "PARENTS NEED SUPPORT TOO",
      subtitle: "Busy schedules, missing resources",
    },
    {
      quote:
        '"I fear our ancestral language and beautiful proverbs will stop with my generation."',
      title: "A GENERATION AT RISK",
      subtitle: "Losing connection to grandparents",
    },
  ];

  // Container variants for staggered entrance sequence
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Card variant: Slides in from the LEFT (x: -60 -> x: 0)
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: -60 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <section className="bg-[#FFFFFF] px-6 lg:px-16 py-16 lg:py-24 font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        
        {/* Section Header */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#154734] uppercase">
          THE HERITAGE GAP
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-4xl mx-auto">
          Your Child Shouldn’t Have to Lose a Language to Grow Up Somewhere Else
        </h2>

        <p className="text-base sm:text-lg text-[#55665E] max-w-2xl mx-auto pt-2">
          Living away from Nigeria shouldn't mean growing apart from your roots. Many diaspora parents face the same quiet challenges.
        </p>

        {/* Animated Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-12 text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {painPoints.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group h-full bg-[#FFFDF9] rounded-[28px] p-6 lg:p-8 border border-[#EBE3D5] shadow-xs 
                         transition-all duration-300 ease-out 
                         hover:-translate-y-2 hover:shadow-xl hover:bg-white hover:border-[#154734]/30 
                         flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-6">
                {/* Icon Container */}
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#FBF3E6] border border-[#F3E7D3] 
                                flex items-center justify-center 
                                group-hover:bg-[#154734]/10 group-hover:border-[#154734]/20 
                                transition-colors duration-300"
                >
                  <Quote className="w-6 h-6 lg:w-7 lg:h-7 text-[#154734] fill-[#154734]/10 rotate-180 
                                    group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>

                {/* Quote Text */}
                <p className="text-base lg:text-lg font-bold italic text-[#1C2823] leading-relaxed">
                  {item.quote}
                </p>
              </div>

              {/* Divider & Footer */}
              <div className="pt-6 mt-8 border-t border-[#F0E6D8] group-hover:border-[#154734]/15 transition-colors duration-300">
                <p className="text-xs font-extrabold tracking-wider text-[#154734] uppercase">
                  {item.title}
                </p>
                <p className="text-xs text-[#62736B] font-medium mt-1">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}