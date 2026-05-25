import React from "react";
import { ChevronRight, ShoppingCart, Search, MapPin, Calendar, Trophy, ChevronDown } from "lucide-react";
import { HomeSearchInput } from "./HomeSearchInput";

// Custom premium outline icons wrapped in a perfect circle, matching the reference mockup exactly
const CalendarTicketIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <rect x="7" y="8" width="10" height="8" rx="1.2" strokeWidth="1.2" />
    <path d="M7 12a1.5 1.5 0 0 1 3 0M17 12a1.5 1.5 0 0 0-3 0" strokeWidth="1.2" />
    <path d="M12 8v8" strokeDasharray="1.5 1.5" strokeWidth="1" />
  </svg>
);

const BarChartIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15v-3M12 15V9M16 15v-5" strokeWidth="1.5" />
    <path d="M7 16h10" strokeWidth="1.2" />
  </svg>
);

const ShieldIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 15.5s3.5-1.5 3.5-4.5V8.5l-3.5-1.5-3.5 1.5V11c0 3 3.5 4.5 3.5 4.5z" strokeWidth="1.2" />
  </svg>
);

const ProfileIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="2.5" strokeWidth="1.2" />
    <path d="M7.5 16.5c0-1.8 1.8-3 4.5-3s4.5 1.2 4.5 3" strokeWidth="1.2" />
  </svg>
);

// High-fidelity vector metallic keychain with floating animations, neon base and glowing Pegasus logo
const SmartKeychainGraphic = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`pointer-events-none select-none z-20 overflow-visible animate-float-keychain ${className}`}>
      <svg
        viewBox="0 0 220 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Metallic Gradients */}
          <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#d1d7e0" />
            <stop offset="45%" stopColor="#7e8896" />
            <stop offset="50%" stopColor="#3a414c" />
            <stop offset="55%" stopColor="#7e8896" />
            <stop offset="80%" stopColor="#d1d7e0" />
            <stop offset="100%" stopColor="#1a1d24" />
          </linearGradient>

          <linearGradient id="split-ring-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2c303b" />
            <stop offset="30%" stopColor="#8b95a5" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#8b95a5" />
            <stop offset="100%" stopColor="#17191e" />
          </linearGradient>

          {/* Disc Radial Face Gradient (Matte Black Leather texture look) */}
          <radialGradient id="disc-face-grad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1f2638" />
            <stop offset="50%" stopColor="#0b0e15" />
            <stop offset="100%" stopColor="#040507" />
          </radialGradient>

          {/* Glowing Filters */}
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="pedestal-blur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
          </filter>
        </defs>

        {/* 1. Neon Pedestal Glow (Base of the keychain - Perfectly aligned horizontally) */}
        <g className="animate-pulse-pedestal">
          {/* Cyan glow shadow */}
          <ellipse cx="110" cy="205" rx="65" ry="12" fill="#00f0ff" opacity="0.25" filter="url(#pedestal-blur)" />
          {/* Bright outer ring */}
          <ellipse cx="110" cy="205" rx="52" ry="9" fill="none" stroke="#00f0ff" strokeWidth="2.5" opacity="0.9" filter="url(#neon-glow)" />
          {/* Inner ring */}
          <ellipse cx="110" cy="205" rx="36" ry="6" fill="none" stroke="#00f0ff" strokeWidth="1.2" opacity="0.5" />
        </g>

        {/* 2. Floating Metallic Keychain (Disc + Keyring) */}
        <g className="origin-[110px_130px]">
          
          {/* A. Metallic Split-Ring at the top-right */}
          {/* Inner torus shadow */}
          <circle cx="165" cy="55" r="26" fill="none" stroke="#050810" strokeWidth="6" opacity="0.5" />
          {/* Torus body */}
          <circle cx="165" cy="55" r="26" fill="none" stroke="url(#split-ring-grad)" strokeWidth="5" />
          {/* Highlight ridge */}
          <circle cx="165" cy="55" r="27.5" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

          {/* B. Chain Link Loops connecting ring to disc */}
          {/* Link 1 (attached to split ring) */}
          <path
            d="M 148 72 C 151 66, 158 60, 162 64 C 166 68, 160 74, 156 70"
            fill="none"
            stroke="url(#chrome-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Link 2 (passing through the disc hole) */}
          <path
            d="M 132 87 C 135 81, 143 75, 146 79 C 149 83, 142 89, 138 85"
            fill="none"
            stroke="url(#chrome-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* C. The Main Circular Pendant/Disc (Significantly enlarged) */}
          {/* Outer Bezel (Shiny chrome metal rim) */}
          <circle cx="110" cy="130" r="55" fill="url(#chrome-grad)" />
          
          {/* Shadow recess just inside the metal rim */}
          <circle cx="110" cy="130" r="52" fill="#04060b" />
          
          {/* Keychain Disc Face (Dark carbon-metallic background) */}
          <circle cx="110" cy="130" r="50" fill="url(#disc-face-grad)" />

          {/* D. Glowing Pegasight Logo / Emblem inside the Disc */}
          {/* Subtle cyan inner circular lighting trail */}
          <circle cx="110" cy="130" r="47" fill="none" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3" />
          
          {/* Logo Graphic Layer (Fully transparent PNG) */}
          <g>
            <image
              href="/logo.png"
              x="72"
              y="98"
              width="76"
              height="64"
              className="filter drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.98)] transition-all duration-300"
            />
          </g>

          {/* E. Mechanical attachment Hole at the top of the disc */}
          <circle cx="123" cy="92" r="4" fill="#030508" stroke="url(#chrome-grad)" strokeWidth="1.2" />
        </g>
      </svg>

      {/* Embedded CSS style for custom keyframe animations */}
      <style>{`
        @keyframes float-keychain {
          0%, 100% {
            transform: translateY(0px) rotate(-1.5deg);
          }
          50% {
            transform: translateY(-10px) rotate(1.2deg);
          }
        }
        @keyframes pulse-pedestal {
          0%, 100% {
            opacity: 0.75;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
        .animate-float-keychain {
          animation: float-keychain 4.5s ease-in-out infinite;
        }
        .animate-pulse-pedestal {
          animation: pulse-pedestal 3.5s ease-in-out infinite;
          transform-origin: 110px 205px;
        }
      `}</style>
    </div>
  );
};

export const HomeHero = () => {
  return (
    <div className="relative w-full bg-[#04080f] pt-16 md:pt-20 pb-0 select-none">

      {/* Base gradient */}
      <div className="absolute inset-0"
           style={{ background: "linear-gradient(160deg, #020408 0%, #04080f 55%, #060c18 100%)" }}
      />

      {/* Blue atmosphere — centered where the player is */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: "radial-gradient(circle at 65% 55%, rgba(0, 150, 255, 0.15) 0%, transparent 60%)"
           }}
      />

      {/* Cyberpunk Grid Floor */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-full lg:h-[60%]">
        <div className="absolute inset-0"
             style={{
               backgroundImage: "linear-gradient(to top, rgba(0, 136, 255, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0, 136, 255, 0.1) 1px, transparent 1px)",
               backgroundSize: "50px 50px",
               transform: "perspective(500px) rotateX(60deg) scale(2.5)",
               transformOrigin: "top center",
               maskImage: "linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)",
               WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)",
             }}
        />
        {/* Floor reflection line */}
        <div className="absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0088ff]/30 to-transparent" />
      </div>

      {/* ── PLAYER: absolutely centered in hero, behind grid content ── */}
      {/* mix-blend-mode:screen removes the dark box — only bright pixels show */}
      <div className="absolute hidden lg:flex items-center justify-end pointer-events-none pr-[20%]"
           style={{ inset: 0, zIndex: 1, top: "40px" }}>
        <img
          src="/jugador.png"
          alt=""
          className="h-[115%] w-auto opacity-95 drop-shadow-[0_0_15px_rgba(0,136,255,0.4)]"
          style={{
            mixBlendMode: "screen",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), " +
              "linear-gradient(to bottom, transparent 0%, black 5%, black 90%, transparent 100%)",
            WebkitMaskComposite: "destination-in",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), " +
              "linear-gradient(to bottom, transparent 0%, black 5%, black 90%, transparent 100%)",
            maskComposite: "intersect",
          }}
        />
      </div>

      {/* Content grid: text | spacer(player behind) | card */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-0"
           style={{ minHeight: "360px", zIndex: 10 }}>

        {/* ── LEFT: Text (5 cols) ── */}
        <div className="flex flex-col justify-center space-y-5 lg:space-y-6 lg:col-span-5 py-6 lg:py-10 relative z-40">
          <h1 className="font-bold italic uppercase select-none leading-tight"
              style={{ fontSize: "clamp(28px, 7.5vw, 48px)" }}>
            <span className="block whitespace-nowrap text-white">
              VIVE CADA <span className="text-[#0088ff] drop-shadow-[0_0_10px_rgba(0,136,255,0.4)]">TORNEO.</span>
            </span>
            <span className="block whitespace-nowrap text-white">
              SIGUE CADA <span className="text-[#0088ff] drop-shadow-[0_0_10px_rgba(0,136,255,0.4)]">PASIÓN.</span>
            </span>
          </h1>
          <p className="text-brand-text-muted text-sm font-light leading-relaxed"
             style={{ maxWidth: "280px" }}>
            La plataforma definitiva para el seguimiento<br />de torneos deportivos.
          </p>
          {/* Search Bar Container */}
          <HomeSearchInput />

          {/* Filters Row */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-white/70 hover:text-white">
              <Trophy className="w-3.5 h-3.5" />
              Deporte
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-white/70 hover:text-white">
              <MapPin className="w-3.5 h-3.5" />
              Ubicación
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-white/70 hover:text-white">
              <Calendar className="w-3.5 h-3.5" />
              Fecha
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </div>
        </div>

        {/* ── CENTER: Empty spacer — player renders behind via absolute ── */}
        <div className="hidden lg:block lg:col-span-3" />
        {/* ── RIGHT: Card (4 cols) ── */}
        <div className="flex items-center justify-center lg:justify-end w-full lg:col-span-4 py-6 relative">

          <div className="w-full rounded-2xl relative bg-[#030b17]/30 backdrop-blur-[2px] border border-[#0088ff]/20"
               style={{
                 overflow: "visible",
                 padding: "18px",
                 minHeight: "200px",
                 boxShadow: "0 0 50px rgba(0,136,255,0.05), inset 0 0 40px rgba(0,136,255,0.02)"
               }}>

            {/* Glowing right edge border */}
            <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#00ccff] to-transparent shadow-[0_0_20px_4px_#0088ff] opacity-90 rounded-r-xl pointer-events-none"></div>

            {/* Glow stays clipped inside the card */}
            <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-52 h-52 rounded-full blur-[55px]"
                   style={{ background: "radial-gradient(circle, rgba(0,90,220,0.22), transparent)" }} />
              {/* Blue glow under keychain position */}
              <div className="absolute bottom-4 right-4 w-28 h-5 rounded-full blur-[12px]
                              opacity-55 animate-pulse"
                   style={{ background: "#0066ff" }} />
            </div>

            {/* ── KEYCHAIN: llavero.png fotorrealista, absolutamente posicionado ── */}
            <div className="absolute select-none pointer-events-none"
                 style={{ top: "-20px", right: "-20px", width: "260px", zIndex: 30 }}>

              {/* Sparkles / Destellos behind the keychain */}
              <div className="absolute top-[40px] right-[40px] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_4px_#00ccff] animate-pulse"></div>
              <div className="absolute top-[130px] -right-[5px] w-1 h-1 bg-[#0088ff] rounded-full shadow-[0_0_8px_3px_#0088ff] animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute top-[100px] left-[15px] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_4px_#00ccff] animate-pulse" style={{ animationDelay: "1s" }}></div>
                 
              {/* Neon Platform Base (rendered behind the keychain) */}
              <div className="absolute pointer-events-none z-0"
                   style={{ bottom: "25px", left: "50%", transform: "translateX(-50%)", width: "160px", height: "30px" }}>
                {/* Outer diffuse ambient glow */}
                <div className="absolute inset-0 bg-[#0055ff] rounded-[50%] blur-[20px] opacity-50"></div>
                {/* Sharp glowing cyan ellipse */}
                <div className="absolute top-1/2 left-0 w-full h-[15px] -translate-y-1/2 border-[2px] border-[#0088ff] rounded-[50%] shadow-[0_0_12px_#0088ff,inset_0_0_12px_#0088ff] opacity-100"></div>
                {/* Bright core spot in the center */}
                <div className="absolute top-1/2 left-[25%] w-[50%] h-[6px] -translate-y-1/2 bg-[#0088ff] rounded-[50%] blur-[6px] opacity-90"></div>
              </div>

              {/* Keychain Image */}
              <img
                src="/llavero.png"
                alt="Llavero Inteligente Pegasight"
                className="w-full h-auto object-contain animate-float-keychain relative z-10
                           drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Text content — right padding avoids keychain overlap */}
            <div className="relative z-10 flex flex-col gap-3" style={{ paddingRight: "105px" }}>

              <div>
                <h3 className="font-bold italic uppercase leading-[1.15] select-none"
                    style={{ fontSize: "clamp(15px, 1.35vw, 19px)" }}>
                  <span className="text-white block">ADQUIERE TU</span>
                  <span className="text-[#0088ff] block">LLAVERO INTELIGENTE</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                  Tu acceso. Tu identidad. Tu pasión.
                </p>
              </div>

              <div className="space-y-[6px] select-none">
                {([
                  [CalendarTicketIcon, "Acceso rápido a torneos"],
                  [BarChartIcon,       "Estadísticas personalizadas"],
                  [ShieldIcon,         "Seguridad y tecnología"],
                  [ProfileIcon,        "Vinculado a tu perfil"],
                ] as [React.FC<{ className?: string }>, string][]).map(([Icon, text]) => (
                  <div key={text} className="flex items-center gap-2 group">
                    <Icon className="w-[13px] h-[13px] text-[#0088ff] shrink-0
                                     transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-gray-300 font-light text-[11.5px]">{text}</span>
                  </div>
                ))}
              </div>

              <div>
                <button className="flex items-center justify-center gap-2 px-5 py-2.5 text-[12px] font-semibold text-white border-2 border-[#0088ff]/50 rounded-full hover:bg-[#0088ff]/10 hover:border-[#0088ff] hover:shadow-[0_0_15px_rgba(0,136,255,0.4)] transition-all duration-300 backdrop-blur-sm">
                  <ShoppingCart size={14} className="shrink-0 text-[#0088ff]" />
                  Comprar ahora
                </button>
                <p className="text-[10px] text-gray-500 mt-2 italic leading-snug">
                  Ingresa con tu llavero y vive la experiencia completa.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
