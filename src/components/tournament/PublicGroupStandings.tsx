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

function safeRatio(a: number, b: number): string {
  if (b === 0) return a > 0 ? "999.000" : "0.000";
  return (a / b).toFixed(3);
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
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${hasMultipleGroups && groupKeys.length >= 2 ? "xl:grid-cols-2" : ""} gap-6`}>
        {groupKeys.map((groupKey) => {
          const teams = [...grouped[groupKey]].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const ratioA = a.lost === 0 ? 999 : a.won / a.lost;
            const ratioB = b.lost === 0 ? 999 : b.won / b.lost;
            if (ratioB !== ratioA) return ratioB - ratioA;
            return b.goals_for - a.goals_for;
          });

          return (
            <div
              key={groupKey}
              className="rounded-2xl border border-[#00f0ff]/10 overflow-hidden"
              style={{ background: "rgba(5,8,17,0.85)", backdropFilter: "blur(16px)" }}
            >
              {/* Group header */}
              {hasMultipleGroups && (
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#00f0ff]/10 bg-[#0a1526]/70">
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
                      <th className="py-3 px-3 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest text-center w-8">
                        #
                      </th>
                      <th className="py-3 px-3 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest">
                        Equipo
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Partidos Jugados">
                        PJ
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Partidos Ganados">
                        PG
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Partidos Perdidos">
                        PP
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Sets Favor:Contra">
                        Sets (F:A)
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Ratio de Sets">
                        Ratio S
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Puntos Favor:Contra">
                        Puntos (F:A)
                      </th>
                      <th className="py-3 px-2 text-[9px] text-white/40 font-bold uppercase tracking-widest text-center" title="Ratio de Puntos">
                        Ratio P
                      </th>
                      <th className="py-3 px-3 text-[10px] text-[#00f0ff] font-black uppercase tracking-widest text-center">
                        Puntos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => {
                      const isFirst = index === 0;
                      const isSecond = index === 1;

                      const setRatio = safeRatio(team.won, team.lost);
                      const goalRatio = safeRatio(team.goals_for, team.goals_against);

                      return (
                        <tr
                          key={team.team_id}
                          className={`border-b border-white/5 last:border-0 transition-colors
                            ${isFirst ? "bg-[#00f0ff]/5" : isSecond ? "bg-[#0055cc]/5" : "hover:bg-white/[0.02]"}`}
                        >
                          {/* # */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold
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

                          {/* Equipo */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                {team.logo_url ? (
                                  <Image
                                    src={team.logo_url}
                                    alt={team.team_name}
                                    width={28}
                                    height={28}
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <Shield className="w-4 h-4 text-white/20" />
                                )}
                              </div>
                              <span
                                className={`text-xs font-bold uppercase tracking-wider truncate max-w-[90px] sm:max-w-[140px] xl:max-w-none ${
                                  isFirst ? "text-white" : "text-white/80"
                                }`}
                              >
                                {team.team_name}
                              </span>
                            </div>
                          </td>

                          {/* PJ */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">
                            {team.played}
                          </td>

                          {/* PG */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono font-bold text-emerald-400">
                            {team.won}
                          </td>

                          {/* PP */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono font-bold text-red-400">
                            {team.lost}
                          </td>

                          {/* Sets F:A */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">
                            {team.won}:{team.lost}
                          </td>

                          {/* Ratio S */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">
                            {setRatio}
                          </td>

                          {/* Puntos F:A */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">
                            {team.goals_for}:{team.goals_against}
                          </td>

                          {/* Ratio P */}
                          <td className="py-3 px-2 text-center text-[11px] font-mono text-white/60">
                            {goalRatio}
                          </td>

                          {/* Puntos */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-sm font-black font-mono ${
                                isFirst
                                  ? "text-[#00f0ff] drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]"
                                  : "text-white"
                              }`}
                            >
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
    </div>
  );
}
