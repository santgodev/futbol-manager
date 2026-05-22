"use client";
import Image from "next/image";
import { Shield } from "lucide-react";

export function TournamentStandings({ standings }: { standings: any[] }) {
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

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full min-w-[600px] text-left border-collapse">
        <thead>
          <tr className="border-b border-[#0055cc]/20">
            <th className="py-4 px-4 text-[10px] text-[#00f0ff]/50 font-black uppercase tracking-[0.2em] w-12 text-center">Pos</th>
            <th className="py-4 px-4 text-[10px] text-[#00f0ff]/50 font-black uppercase tracking-[0.2em]">Equipo</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">PJ</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">G</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">E</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">P</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">GF</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">GC</th>
            <th className="py-4 px-3 text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">DG</th>
            <th className="py-4 px-4 text-[12px] text-[#00f0ff] font-black uppercase tracking-widest text-center">PTS</th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map((team, index) => {
            const isTop = index === 0;
            return (
              <tr 
                key={team.team_id}
                className={`border-b border-[#0055cc]/10 hover:bg-[#002244]/40 transition-colors ${isTop ? 'bg-[#0055cc]/5' : ''}`}
              >
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-sm text-xs font-bold ${
                    isTop ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-[#001122] text-white/50'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-4 px-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
                    {team.logo_url ? (
                      <Image src={team.logo_url} alt={team.team_name} width={32} height={32} className="object-cover" unoptimized />
                    ) : (
                      <Shield size={16} className="text-white/20" />
                    )}
                  </div>
                  <span className={`font-bold uppercase tracking-widest text-xs ${isTop ? 'text-white' : 'text-white/80'}`}>
                    {team.team_name}
                  </span>
                </td>
                <td className="py-4 px-3 text-center text-xs font-mono text-white/70">{team.played}</td>
                <td className="py-4 px-3 text-center text-xs font-mono text-emerald-400/80">{team.won}</td>
                <td className="py-4 px-3 text-center text-xs font-mono text-white/50">{team.drawn}</td>
                <td className="py-4 px-3 text-center text-xs font-mono text-red-400/80">{team.lost}</td>
                <td className="py-4 px-3 text-center text-xs font-mono text-white/70">{team.goals_for}</td>
                <td className="py-4 px-3 text-center text-xs font-mono text-white/70">{team.goals_against}</td>
                <td className="py-4 px-3 text-center text-xs font-mono text-white/70">
                  {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                </td>
                <td className="py-4 px-4 text-center text-sm font-black font-mono text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  {team.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
