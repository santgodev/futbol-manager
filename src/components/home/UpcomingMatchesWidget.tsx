import { CalendarDays, Shield } from "lucide-react";
import Image from "next/image";

export const UpcomingMatchesWidget = ({ matches = [] }: { matches?: any[] }) => {
  return (
    <div className="panel-premium w-full p-4 md:p-5 flex flex-col h-full relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-30" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-1.5 rounded-lg bg-brand-navy/50 border border-brand-teal/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <CalendarDays className="text-brand-teal drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" size={14} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
          Próximos Partidos
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center gap-3 relative z-10">
        {matches.length === 0 ? (
          <div className="text-center text-[9px] uppercase tracking-widest text-brand-aqua/50 font-bold border border-dashed border-brand-navy/50 rounded-xl py-6">
            No hay partidos programados
          </div>
        ) : (
          matches.map((m) => (
            <div
              key={m.id}
              className="group flex items-center justify-between py-2.5 px-3 rounded-xl border border-brand-navy/50 bg-[#02060d]/80 hover:bg-brand-teal/[0.05] hover:border-brand-teal/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all"
            >
              {/* Home */}
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <span className="text-[10px] font-bold text-brand-sand group-hover:text-white transition-colors uppercase truncate text-right">
                  {m.home_team?.name}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#02060d] border border-brand-navy/80 group-hover:border-brand-teal/50 shadow-[0_0_8px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 overflow-hidden transition-colors">
                  {m.home_team?.logo_url ? (
                    <Image src={m.home_team.logo_url} alt="Local" width={24} height={24} className="object-cover" unoptimized />
                  ) : <Shield size={10} className="text-brand-teal/50" />}
                </div>
              </div>

              {/* VS / Time */}
              <div className="px-3 flex flex-col items-center justify-center shrink-0 border-x border-brand-navy/30">
                <span className="text-[8px] font-semibold text-brand-aqua/60 mb-1 tracking-widest uppercase">
                  {m.match_date ? new Date(m.match_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "TBD"}
                </span>
                <span className="text-[10px] font-black text-brand-teal font-mono px-2 py-0.5 bg-[#02060d] border border-brand-teal/20 rounded-md shadow-[inset_0_0_5px_rgba(0,240,255,0.2)] drop-shadow-[0_0_5px_rgba(0,240,255,0.3)]">
                  {m.match_time ? m.match_time.slice(0, 5) : "TBD"}
                </span>
              </div>

              {/* Away */}
              <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                <div className="w-6 h-6 rounded-full bg-[#02060d] border border-brand-navy/80 group-hover:border-brand-teal/50 shadow-[0_0_8px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 overflow-hidden transition-colors">
                  {m.away_team?.logo_url ? (
                    <Image src={m.away_team.logo_url} alt="Visitante" width={24} height={24} className="object-cover" unoptimized />
                  ) : <Shield size={10} className="text-brand-teal/50" />}
                </div>
                <span className="text-[10px] font-bold text-brand-sand group-hover:text-white transition-colors uppercase truncate text-left">
                  {m.away_team?.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
