"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";

// Zero-dependency count-up component
function CountUpNumber({
  end,
  decimals = 0,
  duration = 2000,
  startAnimate,
}: {
  end: number;
  decimals?: number;
  duration?: number;
  startAnimate: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimate) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(progress * end);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, startAnimate]);

  return <>{count.toFixed(decimals)}</>;
}

export default function TestimonialsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      quote:
        '"My daughter now greets her grandmother in Yoruba every Sunday on FaceTime. I honestly cried the first time it happened. She is learning more than just words — she\'s embracing her roots."',
      name: "Bola A.",
      location: "London, UK",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      quote:
        '"We tried apps and generic YouTube videos, but nothing ever stuck. Ède gave us proper structure and a warm, supportive native teacher who truly understands our diaspora family context."',
      name: "Tunde O.",
      location: "Houston, TX",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
      id="reviews" 
      className="bg-[#FFFFFF] px-6 lg:px-16 py-16 lg:py-24 font-sans overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center space-y-4">
        
        {/* Section Tag */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#D97706] uppercase">
          REAL JOURNEYS
        </p>

        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-4xl mx-auto">
          Families Like Yours Are Already Seeing Results
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#55665E] max-w-2xl mx-auto pt-1">
          Witness how language restores connection across miles and generations.
        </p>

        {/* Testimonials Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-12 pb-16 text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="h-full bg-[#FFFDF9] rounded-[28px] p-6 sm:p-8 lg:p-10 border border-[#EBE3D5] shadow-sm flex flex-col justify-between space-y-8 transition-all duration-300 hover:shadow-md hover:border-[#154734]/20"
            >
              <div className="space-y-6">
                <div className="w-10 h-10 rounded-full bg-[#FEF6E6] border border-[#F3E7D3] flex items-center justify-center text-[#D9A74A]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l2.4 2.8 3.7-.4.9 3.6 3.2 1.9-1.3 3.5 1.3 3.5-3.2 1.9-.9 3.6-3.7-.4L12 22l-2.4-2.8-3.7.4-.9-3.6-3.2-1.9 1.3-3.5-1.3-3.5 3.2-1.9.9-3.6 3.7.4z" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>

                <p className="text-base sm:text-lg text-[#1A2621] font-medium leading-relaxed">
                  {item.quote}
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#EBE3D5]">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1A2621]">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#55665E]">{item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider Line */}
        <div className="border-t border-[#EBE3D5] my-8 sm:my-12" />

        {/* Scroll-Triggered Metrics */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4"
        >
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start text-4xl sm:text-5xl font-extrabold text-[#154734]">
              <CountUpNumber end={500} duration={2000} startAnimate={isInView} />+
            </div>
            <p className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              ACTIVE FAMILIES
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start text-4xl sm:text-5xl font-extrabold text-[#154734]">
              <CountUpNumber end={15} duration={1800} startAnimate={isInView} />+
            </div>
            <p className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              COUNTRIES REPRESENTED
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-4xl sm:text-5xl font-extrabold text-[#154734]">
              <CountUpNumber end={4.9} decimals={1} duration={1800} startAnimate={isInView} />
              <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-[#154734] text-[#154734] -mt-1" />
            </div>
            <p className="text-xs font-bold tracking-widest text-[#D97706] uppercase">
              PARENT HAPPINESS RATING
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}