"use client";
import { useState } from "react";
import Image from "next/image";
import { Shield } from "lucide-react";
import { TeamProfileModal } from "@/components/home/TeamProfileModal";

export function TournamentStandings({ standings, tournamentId, sport }: { standings: any[], tournamentId?: string, sport?: string | null }) {
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isVolleyball = sport === "VOLLEYBALL" || sport === "BEACH_VOLLEYBALL";

  const openTeamProfile = (team: any) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };
  if (!standings || standings.length === 0) {
    return (
      <div className="py-12 text-center text-white/40 text-xs uppercase tracking-widest font-bold">
        Aún no hay equipos con estadísticas en este torneo
      </div>
    );
  }

  // Ordenar por Puntos, Diferencia de Goles, Goles a Favor, y Nombre
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return a.team_name.localeCompare(b.team_name);
  });

  const groupNames = Array.from(
    new Set(sortedStandings.map((t) => t.group_name).filter(Boolean))
  ).sort() as string[];

  const hasGroups = groupNames.length > 0;

  const groupsToRender = hasGroups
    ? groupNames.map((gName) => ({
        name: gName,
        teams: sortedStandings.filter((t) => t.group_name === gName),
      }))
    : [{ name: null, teams: sortedStandings }];

  return (
    <div className="flex flex-col gap-4 p-4">
      {groupsToRender.map((group) => (
        <div
          key={group.name || "general"}
          className="rounded-xl border border-[#0055cc]/25 bg-[#000d1a]/50 overflow-hidden"
        >
          {group.name && (
            <div className="px-4 py-2.5 bg-[#001a33]/80 border-b border-[#0055cc]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  {group.name.toLowerCase().startsWith("grupo") ? group.name : `Grupo ${group.name}`}
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#00f0ff]/60">
                Fase de Grupos • {group.teams.length} Equipos
              </span>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0055cc]/20 bg-[#001122]/40">
                  <th className="py-3 px-3 text-[10px] text-[#00f0ff]/50 font-black uppercase tracking-[0.15em] w-10 text-center">Pos</th>
                  <th className="py-3 px-3 text-[10px] text-[#00f0ff]/50 font-black uppercase tracking-[0.15em] w-full">Equipo</th>
                  <th className="py-3 px-2.5 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center" title="Partidos Jugados">PJ</th>
                  <th className="py-3 px-2.5 text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest text-center" title="Partidos Ganados">PG</th>
                  {!isVolleyball && (
                    <th className="py-3 px-2.5 text-[10px] text-amber-400/70 font-bold uppercase tracking-widest text-center" title="Partidos Empatados">PE</th>
                  )}
                  <th className="py-3 px-2.5 text-[10px] text-red-400/70 font-bold uppercase tracking-widest text-center" title="Partidos Perdidos">PP</th>
                  <th className="py-3 px-2.5 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center" title={isVolleyball ? "Diferencia de Sets" : "Diferencia de Goles"}>
                    {isVolleyball ? "DS" : "DG"}
                  </th>
                  <th className="py-3 px-3 text-[11px] text-[#00f0ff] font-black uppercase tracking-widest text-center">PTS</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, index) => {
                  const isTop = index === 0;
                  const isSecond = index === 1 && group.teams.length >= 4;
                  return (
                    <tr
                      key={team.team_id}
                      onClick={() => openTeamProfile(team)}
                      className={`border-b border-brand-teal/10 last:border-b-0 hover:bg-[#002244]/60 transition-colors cursor-pointer ${
                        isTop ? "bg-brand-teal/10" : isSecond ? "bg-[#00f0ff]/[0.04]" : "bg-transparent"
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                            isTop
                              ? "bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                              : isSecond
                              ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30"
                              : "bg-[#001122] text-white/50"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-black/50 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
                          {team.logo_url ? (
                            <Image src={team.logo_url} alt={team.team_name} width={28} height={28} className="object-cover" unoptimized />
                          ) : (
                            <Shield size={14} className="text-white/20" />
                          )}
                        </div>
                        <span className={`font-bold uppercase tracking-wider text-xs truncate ${isTop ? "text-white" : "text-white/80"}`}>
                          {team.team_name}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 text-center text-xs font-mono text-white/80">{team.played ?? 0}</td>
                      <td className="py-3 px-2.5 text-center text-xs font-mono text-emerald-400/80">{team.won ?? 0}</td>
                      {!isVolleyball && (
                        <td className="py-3 px-2.5 text-center text-xs font-mono text-amber-300/70">{team.drawn ?? 0}</td>
                      )}
                      <td className="py-3 px-2.5 text-center text-xs font-mono text-red-400/70">{team.lost ?? 0}</td>
                      <td className="py-3 px-2.5 text-center text-xs font-mono text-white/70">
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </td>
                      <td className="py-3 px-3 text-center text-sm font-black font-mono text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                        {team.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <TeamProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team={selectedTeam}
        tournamentId={tournamentId}
      />
    </div>
  );
}
