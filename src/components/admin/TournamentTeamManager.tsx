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
    <div className="panel-premium flex flex-col gap-6">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-teal via-brand-aqua to-brand-gold" />
      
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand">
        Equipos Inscritos ({currentTeams.length})
      </h3>

      {/* Inscribir equipo */}
      {teamsToSelect.length > 0 ? (
        <div className="flex gap-4">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex-1 select-premium"
          >
            <option value="" className="bg-black">Seleccionar equipo para inscribir...</option>
            {teamsToSelect.map(team => (
              <option key={team.id} value={team.id} className="bg-black">
                {team.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTeamId || status !== "idle"}
            className="btn-premium-teal min-w-[120px]"
          >
            {status === "adding" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {status === "success" ? "Inscrito" : "Inscribir"}
          </button>
        </div>
      ) : (
        <div className="bg-brand-navy/10 rounded p-4 text-xs text-brand-aqua/40 border border-brand-navy/30 uppercase tracking-wider font-semibold">
          {availableTeams.length === 0 
            ? "No hay equipos en el sistema. Ve a la sección de Equipos para crear uno primero."
            : "Todos los equipos disponibles ya están inscritos en este torneo."}
        </div>
      )}

      {/* Grid de equipos inscritos */}
      {currentTeams.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {currentTeams.map(tt => (
            <div
              key={tt.team_id}
              className="flex flex-col items-center gap-3 p-4 bg-black/40 border border-brand-navy/20 hover:border-brand-teal/30 hover:bg-brand-navy/5 transition-all"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-brand-navy/15 rounded border border-brand-navy/30 overflow-hidden">
                {tt.team?.logo_url ? (
                  <img src={tt.team.logo_url} alt={tt.team.name} className="object-contain max-w-full max-h-full p-1" />
                ) : (
                  <Shield className="w-6 h-6 text-brand-aqua/20" />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sand text-center leading-tight">
                {tt.team?.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center flex flex-col items-center gap-3 border border-dashed border-brand-navy/20 bg-black/5 mt-4">
          <Users size={28} className="text-brand-navy/40" />
          <span className="text-brand-aqua/40 text-xs uppercase tracking-widest font-black">
            No hay equipos inscritos
          </span>
        </div>
      )}
    </div>
  );
}
