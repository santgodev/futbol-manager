"use client";

import { useState } from "react";
import Image from "next/image";
import { addTeamToTournament } from "@/app/admin/actions";
import { Plus, Check, Loader2, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentTeamManager({ tournamentId, availableTeams, currentTeams }: {
  tournamentId: string;
  availableTeams: any[];
  currentTeams: any[];
}) {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [status, setStatus] = useState<"idle" | "adding" | "success">("idle");
  const router = useRouter();

  const currentTeamIds = new Set(currentTeams.map(t => t.team_id));
  const teamsToSelect = availableTeams.filter(t => !currentTeamIds.has(t.id));

  const handleAdd = async () => {
    if (!selectedTeamId) return;
    setStatus("adding");
    try {
      await addTeamToTournament(tournamentId, selectedTeamId);
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setSelectedTeamId("");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Inscribir equipo */}
      {teamsToSelect.length > 0 ? (
        <div className="flex gap-3">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex-1 bg-[#040c1a]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] px-4 py-3 text-white text-xs uppercase tracking-widest rounded-lg outline-none transition-all appearance-none"
          >
            <option value="">Seleccionar equipo para inscribir...</option>
            {teamsToSelect.map(team => (
              <option key={team.id} value={team.id} className="bg-[#040c1a]">
                {team.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTeamId || status !== "idle"}
            className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(0,170,255,0.4)] transition-all"
          >
            {status === "adding" ? <Loader2 className="w-4 h-4 animate-spin" /> :
             status === "success" ? <Check className="w-4 h-4" /> :
             <Plus className="w-4 h-4" />}
            {status === "success" ? "Inscrito" : "Inscribir"}
          </button>
        </div>
      ) : (
        <div className="bg-[#001122]/40 rounded-lg px-4 py-3 text-xs text-white/40 border border-[#0055cc]/10">
          {availableTeams.length === 0 
            ? "No hay equipos en el sistema. Ve a la sección Equipos para crear uno primero."
            : "Todos los equipos disponibles ya están inscritos en este torneo."}
        </div>
      )}

      {/* Grid de equipos inscritos */}
      {currentTeams.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentTeams.map(tt => (
            <div
              key={tt.team_id}
              className="group flex flex-col items-center gap-2 p-4 bg-[#001122]/40 border border-[#0055cc]/20 rounded-xl hover:border-[#00f0ff]/40 hover:bg-[#002255]/30 transition-all"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#001133] rounded-lg border border-[#0055cc]/20 overflow-hidden">
                {tt.team?.logo_url ? (
                  <Image src={tt.team.logo_url} alt={tt.team.name} width={48} height={48} className="object-contain p-1" unoptimized />
                ) : (
                  <Shield size={20} className="text-[#0055cc]/50" />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 text-center leading-tight group-hover:text-[#00f0ff] transition-colors">
                {tt.team?.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center flex flex-col items-center gap-3">
          <Users size={28} className="text-[#0055cc]/30" />
          <span className="text-white/30 text-xs uppercase tracking-widest font-semibold">
            No hay equipos inscritos
          </span>
        </div>
      )}
    </div>
  );
}
