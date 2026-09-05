"use client";

import { useState, Fragment } from "react";
import { BarChart3, Shield, Search, Trophy } from "lucide-react";
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
      <div className="w-full p-6 flex flex-col h-full relative overflow-hidden rounded-[2rem] bg-[#24273A]/80 backdrop-blur-xl border border-[#3A3D55]/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-[#34384C] border border-[#44485F]">
            <Trophy className="text-[#a5b4fc]" size={16} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Clasificación
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
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
              isSearching 
                ? "bg-[#a5b4fc]/20 border-[#a5b4fc] text-[#a5b4fc]" 
                : "bg-[#34384C] border-[#44485F] text-slate-300 hover:bg-[#3E4259] hover:text-white"
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
            className="w-full bg-[#1F2233] border border-[#44485F] rounded-full px-5 py-2.5 text-xs text-white outline-none focus:border-[#a5b4fc] transition-colors shadow-inner"
            autoFocus
          />
        </div>
      )}

      {/* List Header */}
      <div className="flex items-center px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
        <div className="w-6 text-center">#</div>
        <div className="flex-1 ml-2">Equipo</div>
        <div className="w-8 text-center" title="Partidos Jugados">PJ</div>
        <div className="w-8 text-center text-[#a5b4fc]" title="Puntos">PTS</div>
      </div>

      <div className="flex flex-col gap-2">
        {filteredStandings.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-500 font-bold border border-dashed border-[#44485F] rounded-2xl">
            No hay equipos
          </div>
        ) : (
            filteredStandings.map((team, idx) => {
              const rank = team.position || idx + 1;
              const isFirst = rank === 1;
              return (
                <div
                  key={team.team_id}
                  onClick={() => openTeamProfile(team)}
                  className={`group flex items-center px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-sm ${
                    isFirst
                      ? "bg-[#3A4064] border border-[#a5b4fc]/30"
                      : "bg-[#2A2E43] border border-[#3A3D55]/50 hover:bg-[#34384C]"
                  }`}
                >
                  <div className="w-6 text-center">
                    <span className={`text-xs font-bold ${isFirst ? "text-[#a5b4fc]" : "text-slate-400 group-hover:text-white transition-colors"}`}>
                      {rank}
                    </span>
                  </div>

                  <div className="flex-1 ml-2 flex items-center min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#151921] border border-[#3A3D55] flex items-center justify-center shrink-0 overflow-hidden mr-2 group-hover:border-[#a5b4fc]/50 transition-colors">
                      {team.logo_url ? (
                        <Image src={team.logo_url} alt={team.team_name} width={24} height={24} className="object-cover" unoptimized />
                      ) : (
                        <Shield size={12} className="text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`text-xs font-semibold truncate block ${isFirst ? "text-white" : "text-slate-300 group-hover:text-white transition-colors"}`}>
                        {team.team_name}
                      </span>
                    </div>
                  </div>

                  <div className="w-8 text-center text-xs font-mono text-slate-400">
                    {team.played}
                  </div>
                  <div className={`w-8 text-center text-sm font-bold font-mono ${isFirst ? "text-[#a5b4fc]" : "text-white"}`}>
                    {team.points}
                  </div>
                </div>
              );
            })
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
