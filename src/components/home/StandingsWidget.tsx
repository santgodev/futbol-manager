"use client";

import { useState, Fragment } from "react";
import { BarChart3, Shield, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

function rankColor(rank: number) {
  if (rank === 1) return "text-brand-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]";
  if (rank <= 3) return "text-brand-cyan";
  return "text-brand-text-muted";
}

function rankBg(rank: number) {
  if (rank === 1) return "bg-yellow-500/5 border-l-2 border-yellow-500";
  if (rank <= 3) return "border-l-2 border-brand-cyan/30";
  return "";
}

export const StandingsWidget = ({ standings = [] }: { standings?: any[] }) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const toggleExpand = (teamId: string) => {
    setExpandedTeam(prev => prev === teamId ? null : teamId);
  };

  return (
    <div className="panel-premium w-full p-6 flex flex-col h-full min-h-[410px] relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/20 blur-[30px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-navy/50 border border-brand-teal/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <BarChart3 className="text-brand-teal drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" size={16} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
            Posiciones
          </h3>
        </div>
        <span className="text-[9px] font-mono text-brand-aqua/40 uppercase tracking-widest hidden md:block">
          toca para ver stats
        </span>
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
                {/* PJ and DG hidden on mobile */}
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 text-center hidden md:table-cell">PJ</th>
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 text-center hidden md:table-cell">DG</th>
                <th className="text-[9px] font-black text-brand-teal drop-shadow-[0_0_5px_rgba(0,240,255,0.3)] uppercase tracking-widest pb-3 text-center">PTS</th>
                {/* Expand toggle only on mobile */}
                <th className="w-6 md:hidden" />
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => {
                const rank = index + 1;
                const isExpanded = expandedTeam === team.team_id;
                return (
                  <Fragment key={team.team_id}>
                    <tr
                      onClick={() => toggleExpand(team.team_id)}
                      className={`border-b border-brand-navy/30 transition-all group cursor-pointer
                        ${rankBg(rank)}
                        hover:bg-brand-teal/[0.05] hover:shadow-[inset_3px_0_0_0_#00f0ff]`}
                    >
                      <td className={`py-3 text-xs font-black text-center ${rankColor(rank)}`}>
                        {rank}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#02060d] border border-brand-teal/20 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:border-brand-teal/50 transition-colors">
                            {team.logo_url ? (
                              <Image src={team.logo_url} alt={team.team_name} width={28} height={28} className="object-cover" unoptimized />
                            ) : (
                              <Shield size={14} className="text-brand-teal/50" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-brand-sand uppercase tracking-wider truncate max-w-[80px] group-hover:text-white transition-colors">
                            {team.team_name}
                          </span>
                        </div>
                      </td>
                      {/* PJ and DG — hidden on mobile */}
                      <td className="py-3 text-center text-xs text-brand-aqua/70 font-mono font-medium hidden md:table-cell">{team.played}</td>
                      <td className="py-3 text-center text-xs text-brand-aqua/70 font-mono font-medium hidden md:table-cell">
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </td>
                      <td className="py-3 text-center text-xs font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:text-brand-teal group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all">
                        {team.points}
                      </td>
                      {/* Expand toggle — mobile only */}
                      <td className="md:hidden text-brand-aqua/30 pr-1">
                        {isExpanded
                          ? <ChevronUp size={12} className="text-brand-cyan" />
                          : <ChevronDown size={12} />
                        }
                      </td>
                    </tr>
                    {/* Expanded stats row — mobile only */}
                    {isExpanded && (
                      <tr className="md:hidden bg-brand-navy/20 border-b border-brand-navy/30">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="grid grid-cols-4 gap-2 text-center">
                            {[
                              { label: "PJ", value: team.played ?? "—" },
                              { label: "DG", value: team.goal_difference !== undefined ? (team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference) : "—" },
                              { label: "GF", value: team.goals_for ?? "—" },
                              { label: "GC", value: team.goals_against ?? "—" },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-brand-aqua/50 uppercase tracking-widest">{label}</span>
                                <span className="text-sm font-black text-brand-sand font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );

              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
