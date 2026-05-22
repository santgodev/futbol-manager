import { CalendarDays, Shield } from "lucide-react";
import Image from "next/image";

export const UpcomingMatchesWidget = ({ matches = [] }: { matches?: any[] }) => {
  return (
    <div className="glass-panel w-full p-3.5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="text-brand-cyan" size={14} />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Próximos Partidos
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        {matches.length === 0 ? (
          <div className="text-center text-[9px] uppercase tracking-widest text-white/30 font-bold">
            No hay partidos programados
          </div>
        ) : (
          matches.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between py-2 px-1.5 rounded border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              {/* Home */}
              <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                <span className="text-[10px] font-bold text-white uppercase truncate text-right">
                  {m.home_team?.name}
                </span>
                <div className="w-[18px] h-[18px] rounded bg-brand-navy border border-brand-cyan/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {m.home_team?.logo_url ? (
                    <Image src={m.home_team.logo_url} alt="Local" width={18} height={18} className="object-cover" unoptimized />
                  ) : <Shield size={9} className="text-brand-cyan/50" />}
                </div>
              </div>

              {/* VS / Time */}
              <div className="px-2 flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] font-semibold text-brand-text-muted mb-0.5 tracking-wider">
                  {m.match_date ? new Date(m.match_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "TBD"}
                </span>
                <span className="text-[10px] font-black text-brand-yellow font-mono px-1.5 py-0.5 bg-brand-yellow/10 rounded">
                  {m.match_time ? m.match_time.slice(0, 5) : "TBD"}
                </span>
              </div>

              {/* Away */}
              <div className="flex items-center gap-1.5 flex-1 justify-start min-w-0">
                <div className="w-[18px] h-[18px] rounded bg-brand-navy border border-brand-cyan/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {m.away_team?.logo_url ? (
                    <Image src={m.away_team.logo_url} alt="Visitante" width={18} height={18} className="object-cover" unoptimized />
                  ) : <Shield size={9} className="text-brand-cyan/50" />}
                </div>
                <span className="text-[10px] font-bold text-white uppercase truncate text-left">
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
