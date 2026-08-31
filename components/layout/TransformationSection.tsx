import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function TransformationSection() {
  const beforePoints = [
    "Little or no Yoruba spoken at home",
    "Child responds primarily in English only",
    "Cultural disconnect from extended family and grandparents",
    "Frustration from lack of structured learning path",
  ];

  const afterPoints = [
    "Child greets grandparents in Yoruba confidently on weekly calls",
    "Singing cultural songs and proudly retelling historic folktales",
    "Thriving sense of pride in their native heritage and identity",
    "Bite-sized, playful lessons parents can track and celebrate",
  ];

  return (
    <section className="bg-[#FFF8ED] px-6 lg:px-16 py-16 lg:py-24 font-sans">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        
        {/* Section Header */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#154734] uppercase">
          THE AWA YORUBA JOURNEY
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2621] leading-tight max-w-4xl mx-auto">
          From Silent Understanding to Confident Conversation
        </h2>

        <p className="text-base sm:text-lg text-[#55665E] max-w-2xl mx-auto pt-1">
          Our structured roadmap bridges the cultural distance, transforming how your child interacts with their heritage.
        </p>

        {/* Transformation Cards Grid - items-stretch aligns height */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-12 text-left">
          
          {/* Left Card: Before AWA YORUBA */}
          <div className="h-full flex flex-col justify-between bg-[#FFFDF9]/60 rounded-[28px] p-8 lg:p-10 border border-[#EADFCB] shadow-xs 
                          transition-all duration-300 ease-out 
                          hover:bg-[#FFFDF9] hover:border-[#D9CBB3] 
                          space-y-6 cursor-pointer"
          >
            <h3 className="text-xl font-bold text-[#8A9790]">
              Before AWA YORUBA
            </h3>

            <ul className="space-y-5 flex-1">
              {beforePoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3.5">
                  <XCircle className="w-5 h-5 text-[#A3B0A8] shrink-0 mt-0.5" />
                  <span className="text-base text-[#8A9790] font-medium leading-snug">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Center Circular Arrow Button */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 
                          w-14 h-14 rounded-full bg-[#114B33] text-[#D9A74A] 
                          items-center justify-center shadow-lg border-4 border-[#FFF8ED] 
                          transition-transform duration-300 hover:scale-110"
          >
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>

          {/* Right Card: After AWA YORUBA */}
          <div className="group h-full flex flex-col justify-between bg-[#FFFDF9] rounded-[28px] p-8 lg:p-10 border-2 border-[#3B2570] shadow-md 
                          transition-all duration-300 ease-out 
                          hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#2E1A63] 
                          space-y-6 relative cursor-pointer overflow-hidden"
          >
            {/* Header + Badge */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#154734]">
                After AWA YORUBA
              </h3>
              <span className="bg-[#FBF3E6] text-[#D97706] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#F3E7D3] 
                               group-hover:bg-[#FFF3E0] group-hover:border-[#FDE68A] transition-colors duration-300"
              >
                ACTIVE FLUENCY
              </span>
            </div>

            <ul className="space-y-5 flex-1">
              {afterPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5 
                                          group-hover:scale-110 transition-transform duration-200" 
                  />
                  <span className="text-base text-[#1A2621] font-semibold leading-snug">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

          </div>

        </div>

      </div>
    </section>
  );
}