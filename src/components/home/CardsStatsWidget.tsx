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
    <div className="glass-panel w-full p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Lock className="text-brand-cyan" size={14} />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Tarjetas
        </h3>
      </div>

      {/* Content: counts + donut */}
      <div className="flex-1 flex items-center justify-around gap-2">
        
        {/* Left: counts */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 bg-brand-yellow rounded-sm shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none">{YELLOW}</span>
              <span className="text-[9px] text-brand-text-muted">Amarillas</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 bg-brand-red rounded-sm shadow-[0_0_6px_rgba(255,51,51,0.5)]" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none">{RED}</span>
              <span className="text-[9px] text-brand-text-muted">Rojas</span>
            </div>
          </div>
        </div>

        {/* Right: donut + labels */}
        <div className="flex items-center gap-2">
          <div className="relative w-[72px] h-[72px] shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* track */}
              <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              {/* yellow arc */}
              <circle
                cx="18" cy="18" r={RADIUS}
                fill="none"
                stroke="#FFD700"
                strokeWidth="4"
                strokeLinecap="butt"
                strokeDasharray={`${yellowDash} ${CIRCUMFERENCE}`}
                strokeDashoffset="0"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }}
              />
              {/* red arc */}
              <circle
                cx="18" cy="18" r={RADIUS}
                fill="none"
                stroke="#FF3333"
                strokeWidth="4"
                strokeLinecap="butt"
                strokeDasharray={`${redDash} ${CIRCUMFERENCE}`}
                strokeDashoffset={`-${yellowDash}`}
                style={{ filter: "drop-shadow(0 0 4px rgba(255,51,51,0.6))" }}
              />
            </svg>
            {/* center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[13px] font-bold text-white leading-none">{YELLOW_PCT}%</span>
            </div>
          </div>

          {/* Legend percentages */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-brand-yellow leading-none">{YELLOW_PCT}%</span>
              <span className="text-[9px] text-brand-text-muted">Amarillas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-brand-red leading-none">{RED_PCT}%</span>
              <span className="text-[9px] text-brand-text-muted">Rojas</span>
            </div>
          </div>
        </div>

      </div>

      <Link
        href="#estadisticas"
        className="text-center text-[10px] text-brand-cyan hover:text-white transition-colors mt-2 block tracking-wider uppercase font-semibold"
      >
        Ver estadísticas completas
      </Link>
    </div>
  );
};
