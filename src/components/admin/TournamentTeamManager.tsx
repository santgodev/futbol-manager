"use client";

import { useState } from "react";
import { addTeamToTournament } from "@/app/admin/actions";
import { Plus, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentTeamManager({ tournamentId, availableTeams, currentTeams }: { tournamentId: string, availableTeams: any[], currentTeams: any[] }) {
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
    <div className="bg-brand-deep border border-brand-navy/30 p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-6">Equipos Participantes ({currentTeams.length})</h3>
      
      <div className="flex gap-4 mb-8">
        <select 
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="flex-1 bg-black border border-brand-navy/50 p-3 text-brand-sand text-xs uppercase tracking-widest outline-none focus:border-brand-teal"
        >
          <option value="">Seleccionar Equipo...</option>
          {teamsToSelect.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <button 
          onClick={handleAdd}
          disabled={!selectedTeamId || status !== "idle"}
          className="bg-brand-teal text-brand-deep px-6 font-bold uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-50"
        >
          {status === "adding" ? <Loader2 className="w-4 h-4 animate-spin" /> : status === "success" ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {status === "success" ? "Añadido" : "Añadir"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentTeams.map(tt => (
          <div key={tt.team_id} className="flex items-center gap-3 p-3 border border-brand-navy/20 bg-black/30">
             <div className="w-8 h-8 flex items-center justify-center bg-brand-navy/10 overflow-hidden">
               {tt.team?.logo_url ? (
                 <img src={tt.team.logo_url} className="w-full h-full object-contain" alt="" />
               ) : (
                 <span className="text-[8px] text-brand-aqua/30">LOGO</span>
               )}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sand truncate">{tt.team?.name}</span>
          </div>
        ))}
        {currentTeams.length === 0 && (
          <div className="col-span-full py-8 text-center border border-dashed border-brand-navy/20">
            <span className="text-[10px] text-brand-aqua/30 uppercase tracking-widest font-bold">No hay equipos inscritos</span>
          </div>
        )}
      </div>
    </div>
  );
}
