"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { addTeamToTournament, removeTeamFromTournament, removeTeamFromCategory, bulkCreateAndEnrollTeams } from "@/app/admin/actions";
import { Plus, Check, Loader2, Users, Shield, XCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentEnrollmentManager({ tournamentId, categoryId, availableTeams, currentTeams, onUpdate, isDisabled = false }: {
  tournamentId: string;
  categoryId?: string | null;
  availableTeams: any[];
  currentTeams: any[];
  onUpdate?: () => void;
  isDisabled?: boolean;
}) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [status, setStatus] = useState<"idle" | "adding" | "success" | "removing">("idle");
  const [teamToRemove, setTeamToRemove] = useState<{ id: string, name: string } | null>(null);
  const router = useRouter();

  const currentTeamIds = new Set(currentTeams.map(t => t.team_id));
  const teamsToSelect = availableTeams.filter(t => !currentTeamIds.has(t.id));
  const teamsWithoutGroup = currentTeams.filter(t => !t.group_name);

  const toggleSelection = (id: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedTeamIds.length === 0 || isDisabled) return;
    setStatus("adding");
    try {
      await Promise.all(
        selectedTeamIds.map(teamId => addTeamToTournament(tournamentId, teamId, undefined, categoryId))
      );
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setSelectedTeamIds([]);
        if (onUpdate) onUpdate();
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim() || isDisabled) return;
    setStatus("adding");
    try {
      await bulkCreateAndEnrollTeams(tournamentId, categoryId, bulkText);
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setBulkText("");
        setIsBulkMode(false);
        if (onUpdate) onUpdate();
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStatus("idle");
      alert("Error agregando lista: " + err.message);
    }
  };

  const confirmRemove = async () => {
    if (!teamToRemove || isDisabled) return;
    setStatus("removing");
    try {
      if (categoryId) {
        await removeTeamFromCategory(tournamentId, teamToRemove.id, categoryId);
      } else {
        await removeTeamFromTournament(tournamentId, teamToRemove.id);
      }
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

      {/* Panel de Inscripción */}
      <div className="flex flex-col gap-4 bg-[#02060d]/50 p-4 rounded-xl border border-brand-navy/30">
        <div className="flex items-center justify-between gap-4 border-b border-brand-navy/30 pb-3">
          <div className="text-xs text-brand-aqua/50 uppercase tracking-widest font-bold">
            Agregar Equipos al Torneo
          </div>
          <button
            onClick={() => setIsBulkMode(!isBulkMode)}
            className="text-[10px] font-bold uppercase tracking-widest text-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 px-3 py-1.5 rounded-md transition-colors"
          >
            {isBulkMode ? "Modo Selección" : "Pegar Lista"}
          </button>
        </div>

        {isBulkMode ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/50">
              Escribe o pega una lista de equipos, uno por línea. El sistema los creará automáticamente si no existen y los inscribirá.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              disabled={isDisabled || status === "adding"}
              placeholder="Dragones FC&#10;Atlético City&#10;Tigres..."
              className="w-full h-32 bg-[#050b14] border border-brand-navy/50 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-brand-teal/50 transition-colors resize-none custom-scrollbar"
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={handleBulkAdd}
                disabled={!bulkText.trim() || status !== "idle" || isDisabled}
                className="w-full sm:w-auto bg-gradient-to-r from-brand-teal to-brand-aqua text-brand-deep px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "adding" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {status === "success" ? "Inscritos" : "Inscribir Lista"}
              </button>
            </div>
          </div>
        ) : (
          teamsToSelect.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                {teamsToSelect.map(team => {
                  const isSelected = selectedTeamIds.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => toggleSelection(team.id)}
                      disabled={isDisabled}
                      type="button"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                        isSelected 
                          ? "bg-[#00f0ff]/10 border-[#00f0ff]/50 text-[#00f0ff]" 
                          : "bg-[#050b14]/50 border-brand-navy/30 text-white/60 hover:bg-white/5"
                      } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isSelected ? "bg-[#00f0ff] border-[#00f0ff]" : "border-brand-navy/50"}`}>
                        {isSelected && <Check size={12} className="text-black" />}
                      </div>
                      {team.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-brand-navy/30">
                <span className="text-xs text-brand-aqua/60 font-bold uppercase tracking-widest">
                  {selectedTeamIds.length} {selectedTeamIds.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'}
                </span>
                <button
                  onClick={handleAdd}
                  disabled={selectedTeamIds.length === 0 || status !== "idle" || isDisabled}
                  className="w-full sm:w-auto bg-gradient-to-r from-brand-teal to-brand-aqua text-brand-deep px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "adding" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === "success" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {status === "success" ? "Inscritos" : `Inscribir Selección`}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-brand-navy/10 rounded p-4 text-xs text-brand-aqua/40 border border-brand-navy/30 uppercase tracking-wider font-semibold">
              Todos los equipos existentes ya están inscritos. Usa "Pegar Lista" para agregar equipos nuevos rápidamente.
            </div>
          )
        )}
      </div>

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
