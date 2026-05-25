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
    <div className="panel-premium w-full p-6 flex flex-col h-full min-h-[410px] relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/20 blur-[30px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-navy/50 border border-brand-teal/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <BarChart3 className="text-brand-teal drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" size={16} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
            Posiciones
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 relative z-10">
        {standings.length === 0 ? (
           <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-widest text-brand-aqua/50 font-bold border border-dashed border-brand-navy/50 rounded-xl">
             Aún no hay puntos
           </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-navy/50">
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 w-8 text-center">#</th>
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3">Equipo</th>
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 text-center">PJ</th>
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 text-center">DG</th>
                <th className="text-[9px] font-black text-brand-teal drop-shadow-[0_0_5px_rgba(0,240,255,0.3)] uppercase tracking-widest pb-3 text-center">PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={team.team_id}
                    className="border-b border-brand-navy/30 hover:bg-brand-teal/[0.05] hover:shadow-[inset_3px_0_0_0_#00f0ff] transition-all group"
                  >
                    <td className={`py-3 text-xs font-black text-center ${rankColor(rank)}`}>
                      {rank}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#02060d] border border-brand-teal/20 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:border-brand-teal/50 transition-colors">
                          {team.logo_url ? (
                            <Image src={team.logo_url} alt={team.team_name} width={28} height={28} className="object-cover" unoptimized />
                          ) : (
                            <Shield size={14} className="text-brand-teal/50" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-brand-sand uppercase tracking-wider truncate max-w-[90px] group-hover:text-white transition-colors">
                          {team.team_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-xs text-brand-aqua/70 font-mono font-medium">{team.played}</td>
                    <td className="py-3 text-center text-xs text-brand-aqua/70 font-mono font-medium">{team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}</td>
                    <td className="py-3 text-center text-xs font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:text-brand-teal group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all">{team.points}</td>
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
