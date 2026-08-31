"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);

      if (elem) {
        elem.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const footerSections = [
    {
      title: "COMPANY",
      links: [
        { label: "About", href: "#about" },
        { label: "Team", href: "#team" },
        { label: "Careers", href: "#careers" },
        { label: "Impact", href: "#impact" },
      ],
    },
    {
      title: "PROGRAMS",
      links: [
        { label: "Little Explorers (Ages 5–7)", href: "#programs" },
        { label: "Young Speakers (Ages 8–10)", href: "#programs" },
        { label: "Heritage Builders (Ages 11–12)", href: "#programs" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { label: "How It Works", href: "#how-it-works" },
        { label: "Stories", href: "#reviews" },
        { label: "For Parents", href: "#for-parents" },
        { label: "Book Free Trial", href: "#trial" },
      ],
    },
    {
      title: "CONNECT",
      links: [
        { label: "Instagram", href: "https://instagram.com" },
        { label: "Twitter / X", href: "https://x.com" },
        { label: "Email Support", href: "mailto:support@awayoruba.com" },
      ],
    },
  ];

  return (
    <footer className="bg-[#171717] text-[#A3A3A3] font-sans px-6 lg:px-16 pt-16 pb-12">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Top Grid: Logo & Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Info (Left Column) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block py-1">
              <Image
                src="/logo.svg"
                alt="ÀWA YORÙBÁ Logo"
                width={180}
                height={60}
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-[#8E8E8E] leading-relaxed max-w-xs">
              Helping the global diaspora keep the beautiful Yoruba language and rich heritage alive for the next generation of pioneers.
            </p>
          </div>

          {/* Nav Links (Right Columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerSections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest text-white uppercase">
                  {section.title}
                </h4>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        onClick={(e) => handleScroll(e, link.href)}
                        className="hover:text-[#E5B252] transition-colors duration-200 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Divider & Bottom Sub-footer */}
        <div className="border-t border-[#262626] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#737373]">
          <p>© {currentYear} ÀWA YORÙBÁ. All rights reserved.</p>
          <p className="text-right">
            Ẹ kú àbọ̀ — Helping the diaspora thrive.
          </p>
        </div>

      </div>
    </footer>
  );
}