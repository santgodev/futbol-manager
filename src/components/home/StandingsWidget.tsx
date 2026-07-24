"use client";

import { useState, Fragment } from "react";
import { BarChart3, Shield, Search } from "lucide-react";
import Image from "next/image";
import { TeamProfileModal } from "./TeamProfileModal";

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

export const StandingsWidget = ({ standings = [], tournamentId }: { standings?: any[], tournamentId?: string }) => {
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStandings = standings.filter(team => 
    team.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTeamProfile = (team: any) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="panel-premium w-full p-6 flex flex-col h-full min-h-[410px] relative overflow-hidden">
        {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/20 blur-[30px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-navy/50 border border-brand-blue/30 shadow-[0_0_10px_rgba(0,136,255,0.1)]">
            <BarChart3 className="text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" size={16} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
            Posiciones
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-brand-aqua/40 uppercase tracking-widest hidden md:block mr-2">
            toca un equipo para ver perfil
          </span>
          <button 
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchTerm("");
            }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              isSearching 
                ? "bg-brand-blue/20 border-brand-blue text-white" 
                : "bg-brand-navy/30 border-brand-blue/30 text-brand-cyan hover:bg-brand-blue/20 hover:border-brand-blue"
            }`}
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      {isSearching && (
        <div className="relative z-10 mb-4 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Buscar equipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-brand-blue/40 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-brand-cyan transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Table */}
      <div className="flex-1 relative z-10">
        {filteredStandings.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-widest text-brand-aqua/50 font-bold border border-dashed border-brand-navy/50 rounded-xl">
            Aún no hay puntos
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-navy/50">
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 w-8 text-center" title="Posición">🏆 #</th>
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3">🛡️ Equipo</th>
                {/* PJ and DG hidden on mobile */}
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 text-center hidden md:table-cell" title="Partidos Jugados">⚽ PJ</th>
                <th className="text-[9px] font-bold text-brand-aqua/60 uppercase tracking-widest pb-3 text-center hidden md:table-cell" title="Diferencia de Goles">⚖️ DG</th>
                <th className="text-[9px] font-black text-brand-teal drop-shadow-[0_0_5px_rgba(0,240,255,0.3)] uppercase tracking-widest pb-3 text-center" title="Puntos">⭐ PTS</th>
                {/* Expand toggle only on mobile */}
                <th className="w-6 md:hidden" />
              </tr>
            </thead>
            <tbody>
              {filteredStandings.map((team, index) => {
                const rank = standings.findIndex(t => t.team_id === team.team_id) + 1;
                return (
                  <Fragment key={team.team_id}>
                    <tr
                      onClick={() => openTeamProfile(team)}
                      className={`border-b border-brand-navy/30 transition-all group cursor-pointer
                        ${rankBg(rank)}
                        hover:bg-brand-blue/[0.1] hover:shadow-[inset_3px_0_0_0_#00f0ff]`}
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
                      {/* Search Icon — mobile only */}
                      <td className="md:hidden text-brand-aqua/30 pr-1 text-right">
                        <Search size={12} className="inline-block group-hover:text-brand-cyan transition-colors" />
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      </div>

      <TeamProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        team={selectedTeam} 
        tournamentId={tournamentId} 
      />
    </>
  );
};
