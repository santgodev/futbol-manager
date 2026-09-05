"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AlignRight, X } from "lucide-react";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "#torneos", label: "Torneos" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#05080b]/95 backdrop-blur-xl border-b border-[#202830]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-8">

          {/* Logo — igual a pegasight.com */}
          <Link
            href="/"
            className="grid leading-[1.1] whitespace-nowrap select-none"
            aria-label="Pegasight Sport — inicio"
          >
            <strong className="text-[16px] font-bold tracking-[0.08em] text-white">
              PEGASIGHT
            </strong>
            <span className="text-[10px] font-semibold tracking-[0.34em] text-[#0a84ff]">
              SPORT
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[13px] font-medium text-[#a7b0ba] hover:text-white rounded-lg hover:bg-white/[0.05] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-[13px] font-semibold text-[#0a84ff] border border-[#0a84ff]/40 rounded-full hover:bg-[#0a84ff]/10 hover:border-[#0a84ff]/70 transition-all duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-[13px] font-semibold text-white bg-[#0a84ff] rounded-full hover:bg-[#2493ff] transition-all duration-200 shadow-[0_2px_12px_rgba(10,132,255,0.3)]"
            >
              Registrarse
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[#202830] text-[#a7b0ba] hover:text-white hover:border-[#0a84ff]/40 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#202830] bg-[#05080b]/98 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-[14px] font-medium text-[#a7b0ba] hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-[#202830] my-2" />
              <Link
                href="/login"
                className="px-4 py-3 text-[14px] font-semibold text-[#0a84ff] hover:bg-[#0a84ff]/10 rounded-xl transition-all"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't go under fixed header */}
      <div className="h-[68px]" />
    </>
  );
};
