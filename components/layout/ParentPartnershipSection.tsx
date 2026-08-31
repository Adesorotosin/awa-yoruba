"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckSquare, Utensils, ShieldCheck } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function ParentPartnershipSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description:
        "Easily book sessions during evenings and weekends that perfectly fit into busy family routines, across any time zone.",
    },
    {
      icon: CheckSquare,
      title: "Progress Reports",
      description:
        "Receive clear weekly summary dashboard notifications with new vocabulary and sound clips of what your child can now say.",
    },
    {
      icon: Utensils,
      title: "Cultural Activities",
      description:
        "Delight in take-home materials, from stepping through traditional Yoruba recipes to trying simple, warm home proverbs together.",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Vetted Tutors",
      description:
        "All tutors are certified native speaker educators based in Nigeria, undergoing thorough background checks and training.",
    },
  ];

  // Stagger sequence active on mobile
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
      id="for-parents" 
      className="bg-[#FFF8ED] px-6 lg:px-16 py-16 lg:py-24 font-sans overflow-hidden"
    >
      <div className="max-w-7xl mx-auto text-center space-y-4">
        
        {/* Section Tag */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#D97706] uppercase">
          PARENT PARTNERSHIP
        </p>

        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-4xl mx-auto">
          Built for Busy Diaspora Parents
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#55665E] max-w-2xl mx-auto pt-1">
          We handle the heavy lifting of cultural education so you can focus on making beautiful memories at home.
        </p>

        {/* 4-Column Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="bg-[#FFFDF9] rounded-[24px] p-7 border border-[#EBE3D5] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Icon Badge */}
                <div className="w-12 h-12 rounded-full bg-[#FCEEE9] flex items-center justify-center text-[#C05638] shrink-0">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Content */}
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-[#1A2621]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55665E] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}