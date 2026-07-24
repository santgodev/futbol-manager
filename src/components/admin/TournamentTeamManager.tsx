"use client";

import { useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { generateRandomGroups, removeTeamFromGroup, assignTeamToGroup } from "@/app/admin/actions";
import { Loader2, Users, Shield, XCircle, Shuffle, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function TournamentGroupManager({ tournamentId, currentTeams, onUpdate, isDisabled = false }: {
  tournamentId: string;
  currentTeams: any[];
  onUpdate?: () => void;
  isDisabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "removing">("idle");
  const [teamToRemove, setTeamToRemove] = useState<{ id: string, name: string } | null>(null);
  const [showRandomConfirm, setShowRandomConfirm] = useState(false);
  const [groupSize, setGroupSize] = useState<number | "">(4);
  const [isGeneratingGroups, setIsGeneratingGroups] = useState(false);
  const [teamToAssignId, setTeamToAssignId] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [assignStatus, setAssignStatus] = useState<"idle" | "assigning" | "success">("idle");
  const router = useRouter();

  const handleAssign = async () => {
    if (!teamToAssignId || !targetGroup || isDisabled) return;
    setAssignStatus("assigning");
    try {
      await assignTeamToGroup(tournamentId, teamToAssignId, targetGroup);
      setAssignStatus("success");
      setTimeout(() => {
        setAssignStatus("idle");
        setTeamToAssignId("");
        setTargetGroup("");
        if (onUpdate) onUpdate();
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);
      setAssignStatus("idle");
    }
  };

  const confirmRemove = async () => {
    if (!teamToRemove || isDisabled) return;
    setStatus("removing");
    try {
      await removeTeamFromGroup(tournamentId, teamToRemove.id);
      if (onUpdate) onUpdate();
      router.refresh();
      setTeamToRemove(null);
    } catch (err: any) {
      console.error(err);
      alert("Error al remover equipo del grupo: " + err.message);
    } finally {
      setStatus("idle");
    }
  };

  const handleGenerateRandomGroups = () => {
    if (isDisabled) return;
    setShowRandomConfirm(true);
  };

  const confirmGenerateRandomGroups = async () => {
    setIsGeneratingGroups(true);
    try {
      await generateRandomGroups(tournamentId, groupSize as number);
      if (onUpdate) onUpdate();
      router.refresh();
      setShowRandomConfirm(false);
    } catch (err: any) {
      console.error(err);
      alert("Error al generar grupos: " + err.message);
    } finally {
      setIsGeneratingGroups(false);
    }
  };

  const teamsByGroup = currentTeams.reduce((acc, team) => {
    const gName = team.group_name ? `Grupo ${team.group_name}` : "Sin Grupo";
    if (!acc[gName]) acc[gName] = [];
    acc[gName].push(team);
    return acc;
  }, {} as Record<string, any[]>);

  const groupKeys = Object.keys(teamsByGroup).filter(g => g !== "Sin Grupo").sort((a, b) => {
    return a.localeCompare(b);
  });
  
  const orphanTeams = teamsByGroup["Sin Grupo"] || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand">
          Distribución de Grupos
        </h3>

        {currentTeams.length > 0 && (
          <div className="flex items-center gap-2 bg-[#02060d]/50 p-2 rounded-xl border border-brand-navy/30">
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-aqua/60 px-2">Sorteo Automático</span>
            <input 
              type="number"
              min={2}
              max={20}
              value={groupSize}
              onChange={(e) => {
                const val = e.target.value;
                setGroupSize(val === "" ? "" : parseInt(val));
              }}
              disabled={isDisabled || isGeneratingGroups}
              className="w-16 bg-black/60 border border-brand-navy/50 focus:border-brand-teal focus:outline-none rounded-lg text-xs text-center text-white py-2"
              title="Equipos por grupo"
            />
            <button
              onClick={handleGenerateRandomGroups}
              disabled={isDisabled || isGeneratingGroups || currentTeams.length === 0 || groupSize === "" || groupSize < 2}
              className="bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/30 p-2 rounded-lg transition-all disabled:opacity-50"
              title="Sortear Grupos"
            >
              {isGeneratingGroups ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* Asignación Manual */}
      {orphanTeams.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 bg-[#02060d]/50 p-4 rounded-xl border border-brand-navy/30 animate-in fade-in slide-in-from-top-4">
          <select
            value={teamToAssignId}
            onChange={(e) => setTeamToAssignId(e.target.value)}
            disabled={isDisabled || assignStatus !== "idle"}
            className="flex-1 w-full p-3 bg-black/60 border border-brand-navy/50 focus:border-brand-teal focus:outline-none rounded-lg text-sm text-white"
          >
            <option value="" className="bg-[#02060d]">1. Selecciona equipo sin asignar...</option>
            {orphanTeams.map((tt: any) => (
              <option key={tt.team_id} value={tt.team_id} className="bg-[#02060d]">
                {tt.team?.name}
              </option>
            ))}
          </select>

          <select
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            disabled={isDisabled || assignStatus !== "idle"}
            className="w-full sm:w-32 p-3 bg-black/60 border border-brand-navy/50 focus:border-brand-teal focus:outline-none rounded-lg text-sm text-white"
          >
            <option value="" className="bg-[#02060d]">Grupo...</option>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(g => (
              <option key={g} value={g} className="bg-[#02060d]">
                Grupo {g}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            disabled={!teamToAssignId || !targetGroup || assignStatus !== "idle" || isDisabled}
            className="w-full sm:w-auto bg-gradient-to-r from-brand-teal to-brand-aqua text-brand-deep px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assignStatus === "assigning" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : assignStatus === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {assignStatus === "success" ? "Asignado" : "Asignar"}
          </button>
        </div>
      )}

      {/* Visualización por grupos */}
      {currentTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {groupKeys.map((groupName) => (
            <div key={groupName} className="flex flex-col bg-[#02060d]/60 border border-brand-teal/20 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              {/* Header del Grupo */}
              <div className="bg-[#050b14]/90 px-4 py-3 border-b border-brand-teal/20 flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,240,255,0.02)]">
                <span className="text-xs font-black uppercase tracking-widest text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-md border border-brand-teal/20">
                  {groupName}
                </span>
                <span className="text-[9px] text-brand-aqua/50 font-bold uppercase tracking-widest">
                  {teamsByGroup[groupName].length} Equipos
                </span>
              </div>
              
              {/* Lista de Equipos */}
              <div className="flex flex-col">
                {teamsByGroup[groupName].map((tt: any, index: number) => (
                  <div
                    key={tt.team_id}
                    className="group flex items-center gap-3 p-3 border-b border-brand-navy/30 last:border-0 hover:bg-[#0a1526] transition-colors relative"
                  >
                    <span className="text-[10px] text-brand-aqua/40 font-black w-4 text-center tabular-nums">
                      {index + 1}
                    </span>
                    <div className="w-8 h-8 flex items-center justify-center bg-[#02060d]/80 rounded border border-brand-navy/30 overflow-hidden shrink-0">
                      {tt.team?.logo_url ? (
                        <img src={tt.team.logo_url} alt={tt.team.name} className="object-contain max-w-full max-h-full p-1" />
                      ) : (
                        <Shield className="w-4 h-4 text-brand-aqua/30" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-brand-sand truncate flex-1">
                      {tt.team?.name}
                    </span>
                    
                    {!isDisabled && (
                      <button
                        onClick={() => setTeamToRemove({ id: tt.team_id, name: tt.team?.name || '' })}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-red-500/80 md:text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all shrink-0"
                        title="Sacar equipo"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        groupKeys.length === 0 && currentTeams.length > 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-4 border border-dashed border-brand-teal/30 bg-brand-teal/5 mt-4 rounded-xl relative overflow-hidden">
            <Shield size={32} className="text-brand-teal/40 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] relative z-10" />
            <span className="text-brand-teal/60 text-xs uppercase tracking-widest font-black relative z-10">
              Usa el Sorteo Automático o Asignación Manual para organizar los equipos
            </span>
          </div>
        ) : null
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
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Quitar del Grupo</h2>
              <p className="text-white/60 text-sm mb-6">
                ¿Estás seguro de que deseas sacar a <span className="text-white font-bold">{teamToRemove.name}</span> de su grupo actual? (Volverá a la lista de "Equipos sin Asignar").
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
                  className="flex-1 py-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  {status === "removing" ? <Loader2 size={16} className="animate-spin" /> : "Quitar del Grupo"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmación Sorteo */}
      {showRandomConfirm && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#040c1a] border border-brand-teal/50 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,240,255,0.2)] relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal to-transparent" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-teal/10 rounded-full blur-[50px]" />
            
            <div className="p-6 relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                <Shuffle size={32} className="text-brand-teal" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Confirmar Sorteo</h2>
              <p className="text-white/60 text-sm mb-6">
                Esto sobreescribirá la asignación manual actual y <span className="text-white font-bold">sorteará a todos los equipos</span> en grupos aleatorios. ¿Deseas continuar?
              </p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowRandomConfirm(false)}
                  disabled={isGeneratingGroups}
                  className="flex-1 py-3 text-xs font-bold text-white/70 bg-white/5 hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmGenerateRandomGroups}
                  disabled={isGeneratingGroups}
                  className="flex-1 py-3 text-xs font-bold text-brand-deep bg-brand-teal hover:bg-brand-aqua rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  {isGeneratingGroups ? <Loader2 size={16} className="animate-spin" /> : "Sí, Sortear"}
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
