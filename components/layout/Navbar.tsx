"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navLinks = [
    { name: "Home", href: "#why-us" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Programs", href: "#programs" },
    { name: "Stories", href: "#reviews" },
    { name: "For Parents", href: "#for-parents" },
    { name: "About", href: "#about" },
  ];

  // Smooth scroll handler
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);

    if (elem) {
      elem.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsMobileMenuOpen(false); // Close mobile drawer
    }
  };

  // Active state observer for section highlighting on scroll
  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.replace("#", ""));
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Triggers when section enters top part of viewport
      threshold: 0,
    };

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#FFF8ED]/95 backdrop-blur-md border-b border-[#EBE3D5] px-4 sm:px-6 lg:px-16 py-3 font-sans transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Container */}
        <Link href="/" className="flex items-center py-1">
          <Image
            src="/logo.svg"
            alt="ÀWA YORÙBÁ Logo"
            width={180}
            height={60}
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#1A2621]">
          {navLinks.map((link, idx) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={idx}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className={`transition-colors cursor-pointer relative py-1 ${
                  isActive
                    ? "text-[#114B33] font-bold"
                    : "hover:text-[#114B33] text-[#1A2621]"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#114B33] rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons & Hamburger Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Desktop CTA Button */}
          <a
            href="#trial"
            onClick={(e) => handleScroll(e, "#trial")}
            className="hidden sm:inline-flex bg-[#114B33] hover:bg-[#0B3524] text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm cursor-pointer"
          >
            Book Free Trial
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#1A2621] hover:text-[#114B33] hover:bg-[#F5EAD7] rounded-xl transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile/Tablet Dropdown Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF8ED] border-b border-[#EBE3D5] px-4 sm:px-6 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 text-base font-medium text-[#1A2621]">
            {navLinks.map((link, idx) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={idx}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  className={`py-2.5 px-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#F5EAD7] text-[#114B33] font-bold"
                      : "hover:bg-[#F5EAD7] hover:text-[#114B33]"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Mobile CTA */}
          <div className="pt-2 sm:hidden">
            <a
              href="#trial"
              onClick={(e) => handleScroll(e, "#trial")}
              className="block text-center bg-[#114B33] hover:bg-[#0B3524] text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-sm w-full cursor-pointer"
            >
              Book Free Trial
            </a>
          </div>
        </div>
      )}
    </header>
  );
}