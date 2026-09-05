"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { Shield } from "@/components/ui/Shield";

interface StandingRow {
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

interface RankingTabProps {
  standings: StandingRow[];
}

function safeRatio(a: number, b: number): string {
  if (b === 0) return a > 0 ? "999.000" : "0.000";
  return (a / b).toFixed(3);
}

/** Rank within original group — position where this team was within their group */
function buildGroupPositions(standings: StandingRow[]): Map<string, number> {
  const grouped: Record<string, StandingRow[]> = {};
  for (const row of standings) {
    const g = row.group_name || "General";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(row);
  }
  const posMap = new Map<string, number>();
  for (const [, teams] of Object.entries(grouped)) {
    const sorted = [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const ratioA = a.lost === 0 ? 999 : a.won / a.lost;
      const ratioB = b.lost === 0 ? 999 : b.won / b.lost;
      if (ratioB !== ratioA) return ratioB - ratioA;
      return b.goals_for - a.goals_for;
    });
    sorted.forEach((t, i) => posMap.set(t.team_id, i + 1));
  }
  return posMap;
}

export function RankingTab({ standings }: RankingTabProps) {
  const posMap = useMemo(() => buildGroupPositions(standings), [standings]);

  const ranked = useMemo(() => {
    return [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const ratioA = a.lost === 0 ? 999 : a.won / a.lost;
      const ratioB = b.lost === 0 ? 999 : b.won / b.lost;
      if (ratioB !== ratioA) return ratioB - ratioA;
      const goalRatioA = a.goals_against === 0 ? 999 : a.goals_for / a.goals_against;
      const goalRatioB = b.goals_against === 0 ? 999 : b.goals_for / b.goals_against;
      return goalRatioB - goalRatioA;
    });
  }, [standings]);

  if (standings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Trophy size={36} className="text-[#018ABE]/50" />
        <p className="text-[#97CADB]/60 text-sm">No hay datos de clasificación disponibles.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[2rem] border border-[#018ABE]/30 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
      style={{ background: "rgba(2,69,122,0.4)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#018ABE]/30 bg-[#001B48]/70">
        <Trophy size={14} className="text-[#018ABE]" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#97CADB]">
          Ranking General Clasificatorio
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#018ABE]/30">
              <th className="py-3 px-3 text-[9px] text-[#97CADB] font-black uppercase tracking-widest text-center w-10">
                POS
              </th>
              <th className="py-3 px-3 text-[9px] text-[#97CADB] font-black uppercase tracking-widest text-left">
                Equipo
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Grupo de origen">
                Origen
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Partidos Jugados">
                PJ
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Ganados">
                PG
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Perdidos">
                PP
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Sets Favor:Contra">
                Sets (F:A)
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Ratio de Sets">
                Ratio S
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Puntos Favor:Contra">
                Puntos (F:A)
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Ratio de Puntos">
                Ratio P
              </th>
              <th className="py-3 px-2 text-[9px] text-[#97CADB] font-bold uppercase tracking-widest text-center" title="Posición en su grupo">
                Pos. Origen
              </th>
              <th className="py-3 px-3 text-[10px] text-[#018ABE] font-black uppercase tracking-widest text-center">
                Puntos
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team, index) => {
              const pos = index + 1;
              const originPos = posMap.get(team.team_id) ?? 0;
              const isTop3 = pos <= 3;
              const groupLabel = team.group_name ? `Grp ${team.group_name}` : "—";

              const setRatio = safeRatio(team.won, team.lost);
              const goalRatio = safeRatio(team.goals_for, team.goals_against);

              return (
                <tr
                  key={team.team_id}
                  className={`border-b border-[#018ABE]/10 last:border-0 transition-colors ${
                    pos === 1
                      ? "bg-[#018ABE]/10"
                      : pos === 2
                      ? "bg-[#018ABE]/5"
                      : pos === 3
                      ? "bg-[#001B48]/50"
                      : "hover:bg-[#001B48]/50"
                  }`}
                >
                  {/* POS */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${
                        pos === 1
                          ? "bg-[#018ABE] text-white shadow-[0_0_8px_rgba(1,138,190,0.4)]"
                          : pos === 2
                          ? "bg-[#018ABE]/40 text-[#D6E8EE]"
                          : pos === 3
                          ? "bg-[#018ABE]/20 text-[#D6E8EE]"
                          : "bg-[#001B48] text-[#97CADB]"
                      }`}
                    >
                      #{pos}
                    </span>
                  </td>

                  {/* Equipo */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#001B48] border border-[#018ABE]/30 flex items-center justify-center overflow-hidden shrink-0">
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
                          <Shield className="w-4 h-4 text-[#018ABE]/50" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[140px] sm:max-w-none ${
                          isTop3 ? "text-white" : "text-[#D6E8EE]"
                        }`}
                      >
                        {team.team_name}
                      </span>
                    </div>
                  </td>

                  {/* Origen */}
                  <td className="py-3 px-2 text-center">
                    <span className="text-[10px] font-mono text-[#018ABE]">
                      {groupLabel}
                    </span>
                  </td>

                  {/* PJ */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono text-[#D6E8EE]">
                    {team.played}
                  </td>

                  {/* PG */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono font-bold text-[#97CADB]">
                    {team.won}
                  </td>

                  {/* PP */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono font-bold text-[#97CADB]">
                    {team.lost}
                  </td>

                  {/* Sets F:A */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono text-[#D6E8EE]">
                    {team.won}:{team.lost}
                  </td>

                  {/* Ratio S */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono text-[#D6E8EE]">
                    {setRatio}
                  </td>

                  {/* Puntos F:A */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono text-[#D6E8EE]">
                    {team.goals_for}:{team.goals_against}
                  </td>

                  {/* Ratio P */}
                  <td className="py-3 px-2 text-center text-[11px] font-mono text-[#D6E8EE]">
                    {goalRatio}
                  </td>

                  {/* Pos. Origen */}
                  <td className="py-3 px-2 text-center">
                    <span className="text-[10px] font-mono text-[#97CADB]">
                      #{originPos}
                    </span>
                  </td>

                  {/* Puntos */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-sm font-black font-mono ${
                        pos === 1
                          ? "text-[#018ABE] drop-shadow-[0_0_6px_rgba(1,138,190,0.5)]"
                          : pos <= 3
                          ? "text-[#018ABE]"
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
}
