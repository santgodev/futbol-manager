"use client";

import { useState } from "react";
import Image from "next/image";
import { addTeamToTournament } from "@/app/admin/actions";
import { Plus, Check, Loader2, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentTeamManager({ tournamentId, availableTeams, currentTeams, onUpdate, isDisabled = false }: {
  tournamentId: string;
  availableTeams: any[];
  currentTeams: any[];
  onUpdate?: () => void;
  isDisabled?: boolean;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [status, setStatus] = useState<"idle" | "adding" | "success">("idle");
  const router = useRouter();

  const currentTeamIds = new Set(currentTeams.map(t => t.team_id));
  const teamsToSelect = availableTeams.filter(t => !currentTeamIds.has(t.id));

  const handleAdd = async () => {
    if (!selectedTeamId || isDisabled) return;
    setStatus("adding");
    try {
      await addTeamToTournament(tournamentId, selectedTeamId);
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setSelectedTeamId("");
        if (onUpdate) onUpdate();
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand">
        Equipos Inscritos ({currentTeams.length})
      </h3>

      {/* Inscribir equipo */}
      {teamsToSelect.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            disabled={isDisabled}
            className={`flex-1 w-full p-3 bg-black/60 border border-brand-navy/50 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal appearance-none rounded-lg text-sm text-white ${
              isDisabled ? 'opacity-40 cursor-not-allowed border-red-500/20 text-white/35' : ''
            }`}
            title={isDisabled ? "Inscripciones bloqueadas debido a inconsistencias críticas" : ""}
          >
            <option value="" className="bg-[#02060d]">Seleccionar equipo para inscribir...</option>
            {teamsToSelect.map(team => (
              <option key={team.id} value={team.id} className="bg-[#02060d]">
                {team.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedTeamId || status !== "idle" || isDisabled}
            className="w-full sm:w-auto bg-gradient-to-r from-brand-teal to-brand-aqua text-brand-deep px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex flex-col items-center gap-3 p-4 bg-[#050b14]/80 border border-brand-teal/30 hover:border-brand-teal hover:bg-[#0a1526] hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all rounded-xl cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-[#02060d]/80 rounded-lg border border-brand-navy/30 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                {tt.team?.logo_url ? (
                  <img src={tt.team.logo_url} alt={tt.team.name} className="object-contain max-w-full max-h-full p-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                ) : (
                  <Shield className="w-6 h-6 text-brand-aqua/30" />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sand text-center leading-tight drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
                {tt.team?.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center flex flex-col items-center gap-4 border border-dashed border-brand-teal/30 bg-brand-teal/5 mt-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-teal/10 rounded-full blur-[40px] pointer-events-none" />
          <Users size={32} className="text-brand-teal/60 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] relative z-10" />
          <span className="text-brand-teal/80 text-xs uppercase tracking-widest font-black relative z-10">
            No hay equipos inscritos
          </span>
        </div>
      )}
    </div>
  );
}
