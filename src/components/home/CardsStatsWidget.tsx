import { Lock } from "lucide-react";
import Link from "next/link";

const YELLOW = 32;
const RED = 8;
const TOTAL = YELLOW + RED;
const YELLOW_PCT = Math.round((YELLOW / TOTAL) * 100);
const RED_PCT = 100 - YELLOW_PCT;

/* SVG donut helpers */
const RADIUS = 15.9155;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 100

export const CardsStatsWidget = () => {
  const yellowDash = (YELLOW_PCT / 100) * CIRCUMFERENCE;
  const redDash = (RED_PCT / 100) * CIRCUMFERENCE;

  return (
    <div className="panel-premium w-full p-4 md:p-5 flex flex-col h-full relative overflow-hidden group">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-30" />
      <div className="absolute top-0 left-0 w-1/2 h-[30px] bg-brand-yellow/10 blur-[30px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-[30px] bg-brand-red/10 blur-[30px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-1.5 rounded-lg bg-brand-navy/50 border border-brand-red/20 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
          <Lock className="text-brand-red drop-shadow-[0_0_8px_rgba(255,51,51,0.5)]" size={14} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
          Tarjetas
        </h3>
      </div>

      {/* Content: counts + donut */}
      <div className="flex-1 flex items-center justify-around gap-2 relative z-10">
        
        {/* Left: counts */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-[#02060d]/80 border border-brand-navy/50 p-2 rounded-xl shadow-[inset_3px_0_0_0_#FFD700] hover:bg-brand-yellow/5 transition-colors">
            <div className="w-3.5 h-5 bg-brand-yellow rounded-sm shadow-[0_0_8px_rgba(255,215,0,0.6)] border border-white/20" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-none drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">{YELLOW}</span>
              <span className="text-[9px] text-brand-aqua/60 uppercase tracking-widest mt-0.5">Amarillas</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#02060d]/80 border border-brand-navy/50 p-2 rounded-xl shadow-[inset_3px_0_0_0_#FF3333] hover:bg-brand-red/5 transition-colors">
            <div className="w-3.5 h-5 bg-brand-red rounded-sm shadow-[0_0_8px_rgba(255,51,51,0.6)] border border-white/20" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-none drop-shadow-[0_0_5px_rgba(255,51,51,0.5)]">{RED}</span>
              <span className="text-[9px] text-brand-aqua/60 uppercase tracking-widest mt-0.5">Rojas</span>
            </div>
          </div>
        </div>

        {/* Right: donut + labels */}
        <div className="flex items-center gap-3">
          <div className="relative w-[76px] h-[76px] shrink-0 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* track */}
              <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              {/* yellow arc */}
              <circle
                cx="18" cy="18" r={RADIUS}
                fill="none"
                stroke="#FFD700"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${yellowDash} ${CIRCUMFERENCE}`}
                strokeDashoffset="0"
                style={{ filter: "drop-shadow(0 0 3px rgba(255,215,0,0.5))" }}
                className="transition-all duration-1000 ease-out"
              />
              {/* red arc */}
              <circle
                cx="18" cy="18" r={RADIUS}
                fill="none"
                stroke="#FF3333"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${redDash} ${CIRCUMFERENCE}`}
                strokeDashoffset={`-${yellowDash}`}
                style={{ filter: "drop-shadow(0 0 3px rgba(255,51,51,0.5))" }}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-white leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{YELLOW_PCT}%</span>
            </div>
          </div>

          {/* Legend percentages */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col border-l-2 border-brand-yellow/30 pl-2">
              <span className="text-[11px] font-black text-brand-yellow leading-none drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">{YELLOW_PCT}%</span>
              <span className="text-[9px] text-brand-aqua/50 uppercase tracking-widest mt-0.5">Amarillas</span>
            </div>
            <div className="flex flex-col border-l-2 border-brand-red/30 pl-2">
              <span className="text-[11px] font-black text-brand-red leading-none drop-shadow-[0_0_5px_rgba(255,51,51,0.5)]">{RED_PCT}%</span>
              <span className="text-[9px] text-brand-aqua/50 uppercase tracking-widest mt-0.5">Rojas</span>
            </div>
          </div>
        </div>

      </div>

      <Link
        href="#estadisticas"
        className="text-center text-[10px] text-brand-teal hover:text-white transition-colors mt-4 block tracking-[0.2em] uppercase font-bold relative z-10"
      >
        Ver estadísticas completas
      </Link>
    </div>
  );
};
