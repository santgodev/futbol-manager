"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { addTeamToTournament, removeTeamFromTournament } from "@/app/admin/actions";
import { Plus, Check, Loader2, Users, Shield, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentEnrollmentManager({ tournamentId, availableTeams, currentTeams, onUpdate, isDisabled = false }: {
  tournamentId: string;
  availableTeams: any[];
  currentTeams: any[];
  onUpdate?: () => void;
  isDisabled?: boolean;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [status, setStatus] = useState<"idle" | "adding" | "success" | "removing">("idle");
  const [teamToRemove, setTeamToRemove] = useState<{ id: string, name: string } | null>(null);
  const router = useRouter();

  const currentTeamIds = new Set(currentTeams.map(t => t.team_id));
  const teamsToSelect = availableTeams.filter(t => !currentTeamIds.has(t.id));
  const teamsWithoutGroup = currentTeams.filter(t => !t.group_name);

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

  const confirmRemove = async () => {
    if (!teamToRemove || isDisabled) return;
    setStatus("removing");
    try {
      await removeTeamFromTournament(tournamentId, teamToRemove.id);
      if (onUpdate) onUpdate();
      router.refresh();
      setTeamToRemove(null);
    } catch (err: any) {
      console.error(err);
      alert("Error al sacar equipo: " + err.message);
    } finally {
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
        <div className="flex flex-col sm:flex-row gap-4 bg-[#02060d]/50 p-4 rounded-xl border border-brand-navy/30">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            disabled={isDisabled}
            className={`flex-1 w-full p-3 bg-black/60 border border-brand-navy/50 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal appearance-none rounded-lg text-sm text-white ${
              isDisabled ? 'opacity-40 cursor-not-allowed border-red-500/20 text-white/35' : ''
            }`}
            title={isDisabled ? "Inscripciones bloqueadas (ya existen partidos o hay inconsistencias)" : ""}
          >
            <option value="" className="bg-[#02060d]">1. Selecciona equipo...</option>
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

      {/* Grid de equipos inscritos sin asignar */}
      {teamsWithoutGroup.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {teamsWithoutGroup.map(tt => (
            <div
              key={tt.team_id}
              onClick={() => { if(!isDisabled) setTeamToRemove({ id: tt.team_id, name: tt.team?.name || '' }) }}
              className="group flex flex-col items-center gap-3 p-4 bg-[#050b14]/80 border border-brand-teal/30 hover:border-red-500/50 hover:bg-red-500/5 transition-all rounded-xl cursor-pointer relative"
              title="Click para ELIMINAR del torneo"
            >
              <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <XCircle size={16} className="text-red-500/80 md:text-red-500" />
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-[#02060d]/80 rounded-lg border border-brand-navy/30 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] group-hover:grayscale">
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
      ) : currentTeams.length > 0 ? (
        <div className="py-12 text-center flex flex-col items-center gap-4 border border-dashed border-brand-teal/30 bg-brand-teal/5 mt-4 rounded-xl relative overflow-hidden">
          <Shield size={32} className="text-brand-teal/40 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] relative z-10" />
          <span className="text-brand-teal/60 text-xs uppercase tracking-widest font-black relative z-10">
            Todos los equipos están asignados a un grupo
          </span>
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

      {/* Modal de Confirmación */}
      {teamToRemove && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#040c1a] border border-red-500/50 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[50px]" />
            
            <div className="p-6 relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Eliminar del Torneo</h2>
              <p className="text-white/60 text-sm mb-6">
                ¿Estás seguro de que deseas eliminar a <span className="text-white font-bold">{teamToRemove.name}</span> del torneo completamente?
              </p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setTeamToRemove(null)}
                  disabled={status === "removing"}
                  className="flex-1 py-3 text-xs font-bold text-white/70 bg-white/5 hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRemove}
                  disabled={status === "removing"}
                  className="flex-1 py-3 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  {status === "removing" ? <Loader2 size={16} className="animate-spin" /> : "Eliminar del Torneo"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
