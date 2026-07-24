import { CalendarDays, Clock, MapPin, Shield } from "lucide-react";
import Image from "next/image";

function getRelativeLabel(dateStr: string | null): { label: string; isToday: boolean; isTomorrow: boolean } {
  if (!dateStr) return { label: "Por definir", isToday: false, isTomorrow: false };
  const today = new Date();
  const match = new Date(dateStr + "T00:00:00");
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matchNorm = new Date(match.getFullYear(), match.getMonth(), match.getDate());
  const diffDays = Math.round((matchNorm.getTime() - todayNorm.getTime()) / 86400000);

  if (diffDays === 0) {
    return { label: "Hoy", isToday: true, isTomorrow: false };
  }

  return {
    label: match.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).replace(".", ""), // quita el punto de feb.
    isToday: false,
    isTomorrow: diffDays === 1,
  };
}

const TeamLogo = ({ logoUrl, name, size = 40 }: { logoUrl?: string | null; name?: string; size?: number }) => (
  <div
    className="rounded-full bg-black/40 backdrop-blur-md border border-brand-blue/30 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_15px_rgba(0,136,255,0.3)]"
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

      {/* Uniform compact list */}
      <div className="flex flex-col gap-2 relative z-10">
        {matches.map((m) => {
          const { label } = getRelativeLabel(m.match_date);
          return (
            <div
              key={m.id}
              className="group flex items-center justify-between py-2 px-3 rounded-xl border border-brand-blue/30 bg-black/30 backdrop-blur-md hover:bg-brand-blue/[0.15] hover:border-brand-blue/60 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <span className="text-[10px] font-bold text-brand-sand uppercase truncate text-right hidden sm:block max-w-[80px]">
                  {m.home_team?.name}
                </span>
                <span className="text-[10px] font-bold text-brand-sand uppercase truncate text-right sm:hidden max-w-[60px]">
                  {m.home_team?.name?.substring(0, 3)}
                </span>
                <TeamLogo logoUrl={m.home_team?.logo_url} name={m.home_team?.name} size={28} />
              </div>

              <div className="px-2 flex flex-col items-center shrink-0">
                <span className="text-[8px] font-mono text-brand-aqua/50">{label}</span>
                <span className="text-[10px] font-black text-brand-teal font-mono">
                  {m.match_time ? m.match_time.slice(0, 5) : "TBD"}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                <TeamLogo logoUrl={m.away_team?.logo_url} name={m.away_team?.name} size={28} />
                <span className="text-[10px] font-bold text-brand-sand uppercase truncate text-left hidden sm:block max-w-[80px]">
                  {m.away_team?.name}
                </span>
                <span className="text-[10px] font-bold text-brand-sand uppercase truncate text-left sm:hidden max-w-[60px]">
                  {m.away_team?.name?.substring(0, 3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
