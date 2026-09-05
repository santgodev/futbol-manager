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
    className="rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
    style={{ width: size, height: size }}
  >
    {logoUrl ? (
      <Image src={logoUrl} alt={name ?? ""} width={size} height={size} className="object-cover" unoptimized />
    ) : (
      <Shield size={size * 0.4} className="text-slate-300" />
    )}
  </div>
);

export const UpcomingMatchesWidget = ({ matches = [] }: { matches?: any[] }) => {
  if (matches.length === 0) {
    return (
      <div className="w-full p-6 flex flex-col h-full relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <CalendarDays className="text-indigo-500" size={16} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
            Próximos Partidos
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl py-6">
          No hay partidos programados
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 flex flex-col h-full relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
          <CalendarDays className="text-indigo-500" size={16} />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
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
              className="group flex items-center justify-between py-2.5 px-4 rounded-full border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                <span className="text-xs font-bold text-slate-700 uppercase truncate text-right hidden sm:block max-w-[90px]">
                  {m.home_team?.name}
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase truncate text-right sm:hidden max-w-[60px]">
                  {m.home_team?.name?.substring(0, 3)}
                </span>
                <TeamLogo logoUrl={m.home_team?.logo_url} name={m.home_team?.name} size={32} />
              </div>

              <div className="px-4 flex flex-col items-center shrink-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-indigo-600 font-mono mt-0.5">
                  {m.match_time ? m.match_time.slice(0, 5) : "TBD"}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-start min-w-0">
                <TeamLogo logoUrl={m.away_team?.logo_url} name={m.away_team?.name} size={32} />
                <span className="text-xs font-bold text-slate-700 uppercase truncate text-left hidden sm:block max-w-[90px]">
                  {m.away_team?.name}
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase truncate text-left sm:hidden max-w-[60px]">
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
