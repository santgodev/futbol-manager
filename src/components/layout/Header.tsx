"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
// 1. Inicio Icon SVG (Rounded corners house with a small flag on the left roof and a 4-pointed star on the right roof)
const InicioIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Flag on the left side of the roof (pointing left, divided horizontally) */}
    <path d="M7 8V4.5M7 4.5H3.5v3H7M3.5 6H7" />
    
    {/* 4-pointed star on the right side of the roof */}
    <path d="M18 3.5 L18.8 4.7 L20 5 L18.8 5.3 L18 6.5 L17.2 5.3 L16 5 L17.2 4.7 Z" />
    
    {/* House Shell with overhanging slanted roof, vertical walls, and rounded bottom corners */}
    <path d="M5 11.5 H3 L12 4 L21 11.5 H19 V19 A2.5 2.5 0 0 1 16.5 21.5 H7.5 A2.5 2.5 0 0 1 5 19 Z" />
    
    {/* Arch Door */}
    <path d="M10 21.5 v-4.5 a2 2 0 0 1 4 0 v4.5" />
  </svg>
);

// 2. Equipos Icon SVG (Detailed Trophy Cup with emblem inside)
const EquiposIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7c0 6 6 8 6 8s6-2 6-8V2z" />
    <circle cx="12" cy="8" r="2.5" />
  </svg>
);

// 3. Posiciones Icon SVG (Bar Chart with Trend Line)
const PosicionesIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="14" width="4" height="6" rx="1" />
    <rect x="10" y="10" width="4" height="10" rx="1" />
    <rect x="16" y="6" width="4" height="14" rx="1" />
    <path d="M2 13l6-4 5 3 8-9" />
  </svg>
);

// 4. Goleador Icon SVG (Classic Soccer Ball)
const GoleadorIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m12 15-3-2V9l3-2 3 2v4z" />
    <path d="M12 15v7" />
    <path d="m9 13-6 2" />
    <path d="m15 13 6 2" />
    <path d="m9 9-4-6" />
    <path d="m15 9 4-6" />
  </svg>
);

// 5. Partidos Icon SVG (Calendar with Clock/Badge)
const PartidosIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M7.5 14h.01M11.5 14h.01M7.5 17.5h.01" />
    <circle cx="17.5" cy="17.5" r="4.5" />
    <path d="M17.5 15v2.5l1.5 1" />
  </svg>
);

// 6. Torneos Icon SVG (Standard Trophy)
const TorneosIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7c0 6 6 8 6 8s6-2 6-8V2z" />
  </svg>
);

// 7. Tarjetas Icon SVG (Overlapping Referee Cards)
const TarjetasIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="10" height="14" x="4" y="6" rx="1" />
    <rect width="10" height="14" x="10" y="2" rx="1" />
  </svg>
);

export const Header = () => {
  const [activeTab, setActiveTab] = useState("/");

  useEffect(() => {
    // Set initial active tab based on current URL hash or pathname
    if (typeof window !== "undefined") {
      setActiveTab(window.location.hash || window.location.pathname);
    }
  }, []);

  return (
    <header className="w-full z-50 bg-[#000000]/95 backdrop-blur-md border-b border-[#0066FF]/10 shadow-[0_4px_30px_rgba(0,0,0,0.9)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        
        {/* Logo Container - Fully Integrated and Transparent */}
        <div className="flex items-center justify-start py-2">
          <Link href="/" onClick={() => setActiveTab("/")} className="relative block h-12 w-[160px] md:h-20 md:w-[220px] lg:w-[240px] select-none shrink-0 group">
            <img 
              src="/logo.png" 
              alt="Pegasight Sport" 
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(0,240,255,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            />
          </Link>
        </div>
        
        {/* Navigation - Centered & Responsive */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6 h-full">
          <NavItem href="/" icon={<InicioIcon className="w-5 h-5" />} label="Inicio" active={activeTab === "/"} onClick={() => setActiveTab("/")} />
          <NavItem href="#equipos" icon={<EquiposIcon className="w-5 h-5" />} label="Equipos" active={activeTab === "#equipos"} onClick={() => setActiveTab("#equipos")} />
          <NavItem href="#posiciones" icon={<PosicionesIcon className="w-5 h-5" />} label="Posiciones" active={activeTab === "#posiciones"} onClick={() => setActiveTab("#posiciones")} />
          <NavItem href="#goleador" icon={<GoleadorIcon className="w-5 h-5" />} label="Goleador" active={activeTab === "#goleador"} onClick={() => setActiveTab("#goleador")} />
          <NavItem href="#partidos" icon={<PartidosIcon className="w-5 h-5" />} label="Partidos" active={activeTab === "#partidos"} onClick={() => setActiveTab("#partidos")} />
          <NavItem href="#torneos" icon={<TorneosIcon className="w-5 h-5" />} label="Torneos" active={activeTab === "#torneos"} onClick={() => setActiveTab("#torneos")} />
          <NavItem href="#tarjetas" icon={<TarjetasIcon className="w-5 h-5" />} label="Tarjetas" active={activeTab === "#tarjetas"} onClick={() => setActiveTab("#tarjetas")} />
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/login" className="hidden md:block px-5 py-2 text-sm font-medium text-white border border-[#0055cc] rounded-[8px] hover:bg-[#0055cc]/15 transition-all duration-200 cursor-pointer">
            Iniciar sesión
          </Link>
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-b from-[#0088ff] to-[#0044cc] rounded-[8px] hover:brightness-110 shadow-[0_2px_8px_rgba(0,136,255,0.2)] transition-all duration-200 cursor-pointer">
            Registrarse
          </Link>
        </div>

      </div>

      {/* Bottom Glowing Line exactly like original */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#0088FF]/55 to-transparent blur-[0.5px] shadow-[0_1px_10px_rgba(0,136,255,0.35)]" />
    </header>
  );
};

function NavItem({ href, icon, label, active = false, onClick }: { href: string, icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="group flex flex-col items-center justify-center h-full px-3 py-1.5 transition-all relative"
    >
      {/* Soft Premium Backlight Spotlight Glow */}
      {active && (
        <div className="absolute w-10 h-10 bg-[#0088ff]/15 rounded-full blur-md pointer-events-none -translate-y-2" />
      )}
      
      {/* Elegant indicator dot above active icon */}
      {active && (
        <span className="absolute top-1 w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse" />
      )}

      <div className={`relative transition-all duration-300 flex items-center justify-center ${
        active 
          ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.7)] scale-105' 
          : 'text-[#8a8a8a] group-hover:text-white transition-colors duration-200'
      }`}>
        {icon}
      </div>
      <span className={`text-[11px] mt-2 font-medium transition-all tracking-wide ${
        active 
          ? 'text-[#00f0ff] font-semibold drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]' 
          : 'text-[#8a8a8a] group-hover:text-white'
      }`}>
        {label}
      </span>
    </Link>
  );
}
