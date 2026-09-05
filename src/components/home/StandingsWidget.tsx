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
  if (rank === 1) return "bg-[#b8860b]/10 border-l-[3px] border-[#b8860b]";
  if (rank <= 3) return "border-l-[3px] border-[#0088ff]/40";
  return "border-l-[3px] border-transparent";
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
      <div className="w-full p-6 flex flex-col h-full min-h-[410px] relative overflow-hidden rounded-xl bg-[#1A1D24] border border-[#2D3342] border-l-[4px] border-l-[#0088ff] shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#222732] border border-[#2D3342]">
            <BarChart3 className="text-[#0088ff]" size={16} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
            Posiciones
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest hidden md:block mr-2">
            toca un equipo
          </span>
          <button 
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchTerm("");
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
              isSearching 
                ? "bg-[#0088ff]/10 border-[#0088ff] text-[#0088ff]" 
                : "bg-[#222732] border-[#2D3342] text-slate-400 hover:bg-[#2A303D] hover:text-slate-200"
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
            className="w-full bg-[#151921] border border-[#2D3342] rounded-lg px-4 py-2 text-xs text-slate-200 outline-none focus:border-[#0088ff] transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Table */}
      <div className="flex-1 relative z-10">
        {filteredStandings.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-widest text-slate-500 font-bold border border-dashed border-[#2D3342] rounded-xl">
            Aún no hay puntos
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2D3342]">
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3 w-8 text-center" title="Posición">#</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3 pl-2">Equipo</th>
                {/* PJ and DG hidden on mobile */}
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3 text-center hidden md:table-cell" title="Partidos Jugados">PJ</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3 text-center hidden md:table-cell" title="Diferencia de Goles">DG</th>
                <th className="text-[10px] font-black text-slate-200 uppercase tracking-widest pb-3 text-center" title="Puntos">PTS</th>
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
                      className={`border-b border-[#2D3342]/50 transition-all group cursor-pointer
                        ${rankBg(rank)}
                        hover:bg-[#222732]`}
                    >
                      <td className={`py-3 text-xs font-bold text-center ${rankColor(rank)}`}>
                        {rank}
                      </td>
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-[#151921] border border-[#2D3342] flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#0088ff]/50 transition-colors">
                            {team.logo_url ? (
                              <Image src={team.logo_url} alt={team.team_name} width={24} height={24} className="object-cover" unoptimized />
                            ) : (
                              <Shield size={12} className="text-slate-600" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide truncate max-w-[90px] group-hover:text-white transition-colors">
                            {team.team_name}
                          </span>
                        </div>
                      </td>
                      {/* PJ and DG — hidden on mobile */}
                      <td className="py-3 text-center text-xs text-slate-400 font-medium hidden md:table-cell">{team.played}</td>
                      <td className="py-3 text-center text-xs text-slate-400 font-medium hidden md:table-cell">
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </td>
                      <td className="py-3 text-center text-xs font-black text-slate-200 group-hover:text-[#0088ff] transition-colors">
                        {team.points}
                      </td>
                      {/* Search Icon — mobile only */}
                      <td className="md:hidden text-slate-600 pr-1 text-right">
                        <Search size={12} className="inline-block group-hover:text-[#0088ff] transition-colors" />
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
