import { CalendarDays, Clock, MapPin, Shield } from "lucide-react";
import Image from "next/image";

/** Returns a human-readable relative label for a date */
function getRelativeLabel(dateStr: string | null): { label: string; isToday: boolean; isTomorrow: boolean } {
  if (!dateStr) return { label: "Por definir", isToday: false, isTomorrow: false };
  const today = new Date();
  const match = new Date(dateStr + "T00:00:00");
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matchNorm = new Date(match.getFullYear(), match.getMonth(), match.getDate());
  const diffDays = Math.round((matchNorm.getTime() - todayNorm.getTime()) / 86400000);

  if (diffDays === 0) return { label: "Hoy", isToday: true, isTomorrow: false };
  if (diffDays === 1) return { label: "Mañana", isToday: false, isTomorrow: true };
  if (diffDays < 0) return { label: `Hace ${Math.abs(diffDays)} días`, isToday: false, isTomorrow: false };
  if (diffDays <= 6) return { label: `En ${diffDays} días`, isToday: false, isTomorrow: false };
  return {
    label: match.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    isToday: false,
    isTomorrow: false,
  };
}

const TeamLogo = ({ logoUrl, name, size = 40 }: { logoUrl?: string | null; name?: string; size?: number }) => (
  <div
    className="rounded-full bg-[#02060d] border border-brand-teal/20 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.6)]"
    style={{ width: size, height: size }}
  >
    {logoUrl ? (
      <Image src={logoUrl} alt={name ?? ""} width={size} height={size} className="object-cover" unoptimized />
    ) : (
      <Shield size={size * 0.4} className="text-brand-teal/40" />
    )}
  </div>
);

export const UpcomingMatchesWidget = ({ matches = [] }: { matches?: any[] }) => {
  if (matches.length === 0) {
    return (
      <div className="panel-premium w-full p-5 flex flex-col h-full relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 rounded-lg bg-brand-navy/50 border border-brand-teal/20">
            <CalendarDays className="text-brand-teal" size={14} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
            Próximos Partidos
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center text-[9px] uppercase tracking-widest text-brand-aqua/50 font-bold border border-dashed border-brand-navy/50 rounded-xl py-6">
          No hay partidos programados
        </div>
      </div>
    );
  }

  const [featured, ...rest] = matches;
  const { label: dateLabel, isToday, isTomorrow } = getRelativeLabel(featured.match_date);

  return (
    <div className="panel-premium w-full p-5 flex flex-col h-full relative overflow-hidden">
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

      {/* Hero match card — first/most upcoming match */}
      <div className="relative z-10 mb-4 rounded-2xl overflow-hidden bg-gradient-to-b from-[#060f1e] to-[#030810] border border-brand-teal/20 p-4">
        {/* Date badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
              isToday
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                : isTomorrow
                ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                : "bg-brand-navy/60 text-brand-aqua/60 border border-brand-navy"
            }`}
          >
            {isToday && "📅 "}{dateLabel}
          </span>
          {featured.match_time && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-brand-teal font-black">
              <Clock size={10} />
              {featured.match_time.slice(0, 5)}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-2">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamLogo logoUrl={featured.home_team?.logo_url} name={featured.home_team?.name} size={44} />
            <span className="text-[10px] font-black text-white uppercase tracking-wide truncate w-full text-center">
              {featured.home_team?.name ?? "TBD"}
            </span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center shrink-0 px-2">
            <span className="text-xl font-black text-brand-teal/50 font-mono tracking-tighter">VS</span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamLogo logoUrl={featured.away_team?.logo_url} name={featured.away_team?.name} size={44} />
            <span className="text-[10px] font-black text-white uppercase tracking-wide truncate w-full text-center">
              {featured.away_team?.name ?? "TBD"}
            </span>
          </div>
        </div>

        {/* Stage label */}
        {featured.stage && (
          <div className="mt-3 pt-2.5 border-t border-brand-navy/50 text-center">
            <span className="text-[9px] font-mono text-brand-aqua/40 uppercase tracking-widest">
              {featured.stage === "GROUP" ? "Fase de Grupos" : featured.stage}
            </span>
          </div>
        )}
      </div>

      {/* Rest of upcoming matches — compact list */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2 relative z-10">
          {rest.map((m) => {
            const { label } = getRelativeLabel(m.match_date);
            return (
              <div
                key={m.id}
                className="group flex items-center justify-between py-2 px-3 rounded-xl border border-brand-navy/50 bg-[#02060d]/80 hover:bg-brand-teal/[0.04] hover:border-brand-teal/20 transition-all"
              >
                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <span className="text-[10px] font-bold text-brand-sand uppercase truncate text-right max-w-[70px]">
                    {m.home_team?.name}
                  </span>
                  <TeamLogo logoUrl={m.home_team?.logo_url} name={m.home_team?.name} size={22} />
                </div>

                <div className="px-2 flex flex-col items-center shrink-0">
                  <span className="text-[8px] font-mono text-brand-aqua/50">{label}</span>
                  <span className="text-[10px] font-black text-brand-teal font-mono">
                    {m.match_time ? m.match_time.slice(0, 5) : "TBD"}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                  <TeamLogo logoUrl={m.away_team?.logo_url} name={m.away_team?.name} size={22} />
                  <span className="text-[10px] font-bold text-brand-sand uppercase truncate max-w-[70px]">
                    {m.away_team?.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
