import { BarChart3, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* Rank color helper */
function rankColor(rank: number) {
  if (rank === 1) return "text-brand-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]";
  if (rank <= 3) return "text-brand-cyan";
  return "text-brand-text-muted";
}

export const StandingsWidget = ({ standings = [] }: { standings?: any[] }) => {
  return (
    <div className="glass-panel w-full p-5 flex flex-col h-full min-h-[410px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-brand-cyan" size={16} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            Posiciones
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1">
        {standings.length === 0 ? (
           <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-widest text-white/30 font-bold">
             Aún no hay puntos
           </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-[9px] font-semibold text-brand-text-muted uppercase tracking-wider pb-2 w-6 text-center">#</th>
                <th className="text-[9px] font-semibold text-brand-text-muted uppercase tracking-wider pb-2">Equipo</th>
                <th className="text-[9px] font-semibold text-brand-text-muted uppercase tracking-wider pb-2 text-center">PJ</th>
                <th className="text-[9px] font-semibold text-brand-text-muted uppercase tracking-wider pb-2 text-center">DG</th>
                <th className="text-[9px] font-black text-brand-cyan uppercase tracking-wider pb-2 text-center">PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={team.team_id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className={`py-2.5 text-xs font-bold text-center ${rankColor(rank)}`}>
                      {rank}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-navy border border-brand-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {team.logo_url ? (
                            <Image src={team.logo_url} alt={team.team_name} width={24} height={24} className="object-cover" unoptimized />
                          ) : (
                            <Shield size={12} className="text-brand-cyan/50" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[80px]">
                          {team.team_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-xs text-brand-text-muted font-mono">{team.played}</td>
                    <td className="py-2.5 text-center text-xs text-brand-text-muted font-mono">{team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}</td>
                    <td className="py-2.5 text-center text-xs font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{team.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
