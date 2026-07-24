"use client";

import { Shield } from "@/components/ui/Shield";
import { Users } from "lucide-react";
import Image from "next/image";

interface TeamRow {
  team_id: string;
  team_name: string;
  logo_url: string | null;
  group_name: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface PublicGroupStandingsProps {
  standings: TeamRow[];
}

export function PublicGroupStandings({ standings }: PublicGroupStandingsProps) {
  if (!standings || standings.length === 0) return null;

  // Agrupar por group_name
  const grouped = standings.reduce((acc: Record<string, TeamRow[]>, team) => {
    const g = team.group_name || "General";
    if (!acc[g]) acc[g] = [];
    acc[g].push(team);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort();
  const hasMultipleGroups = groupKeys.length > 1;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-30" />
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
            {hasMultipleGroups ? "Posiciones por Grupo" : "Tabla de Posiciones"}
          </h2>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${hasMultipleGroups && groupKeys.length >= 2 ? "lg:grid-cols-2" : ""} gap-6`}>
        {groupKeys.map((groupKey) => {
          const teams = [...grouped[groupKey]].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
            return b.goals_for - a.goals_for;
          });

          return (
            <div
              key={groupKey}
              className="rounded-2xl border border-[#00f0ff]/10 overflow-hidden"
              style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}
            >
              {/* Group header */}
              {hasMultipleGroups && (
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#00f0ff]/10">
                  <div className="p-1 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                    <Users size={12} className="text-[#00f0ff]" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00f0ff]">
                    Grupo {groupKey}
                  </span>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#0055cc]/20">
                      <th className="py-3 px-3 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest text-center w-8">#</th>
                      <th className="py-3 px-3 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest">Equipo</th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Partidos Jugados">PJ</th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Ganados">G</th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Empatados">E</th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Perdidos">P</th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Diferencia de Goles">DG</th>
                      <th className="py-3 px-3 text-[10px] text-[#00f0ff] font-black uppercase tracking-widest text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => {
                      const isFirst = index === 0;
                      const isSecond = index === 1;
                      return (
                        <tr
                          key={team.team_id}
                          className={`border-b border-white/5 last:border-0 transition-colors
                            ${isFirst ? "bg-[#00f0ff]/5" : isSecond ? "bg-[#0055cc]/5" : "hover:bg-white/5"}`}
                        >
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold
                              ${isFirst
                                ? "bg-[#00f0ff] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                                : isSecond
                                ? "bg-[#0055cc]/60 text-[#00f0ff]"
                                : "bg-white/5 text-white/40"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                {team.logo_url ? (
                                  <Image src={team.logo_url} alt={team.team_name} width={28} height={28} className="object-cover" unoptimized />
                                ) : (
                                  <Shield className="w-4 h-4 text-white/20" />
                                )}
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-wider truncate max-w-[100px] sm:max-w-none ${isFirst ? "text-white" : "text-white/80"}`}>
                                {team.team_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">{team.played}</td>
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">{team.won}</td>
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">{team.drawn}</td>
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">{team.lost}</td>
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">
                            {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-sm font-black font-mono ${isFirst ? "text-[#00f0ff] drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]" : "text-white"}`}>
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
