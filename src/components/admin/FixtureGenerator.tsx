"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { generateRoundRobinFixture, deleteAllMatchesFromTournament } from "@/app/admin/actions";
import { Loader2, Calendar, X, CheckCircle2, Trash2 } from "lucide-react";

export function FixtureGenerator({
  tournamentId,
  categoryId,
  teams,
  hasGroupMatches,
  onUpdate
}: {
  tournamentId: string;
  categoryId?: string | null;
  teams: any[];
  hasGroupMatches: boolean;
  onUpdate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const teamsCount = teams.length;

  const teamsByGroup = teams.reduce((acc: any, curr: any) => {
    const groupName = curr.group_name || 'UNASSIGNED';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(curr.team_id);
    return acc;
  }, {});

  let numRounds = 0;
  let totalMatches = 0;

  for (const groupName in teamsByGroup) {
    const groupTeamsCount = teamsByGroup[groupName].length;
    if (groupTeamsCount < 2) continue;
    
    const isOdd = groupTeamsCount % 2 !== 0;
    const virtualTeams = isOdd ? groupTeamsCount + 1 : groupTeamsCount;
    const r = virtualTeams - 1;
    const matchesPerRound = virtualTeams / 2;
    const groupMatches = r * (isOdd ? matchesPerRound - 1 : matchesPerRound);

    if (r > numRounds) numRounds = r;
    totalMatches += groupMatches;
  }

  const canGenerate = teamsCount >= 3 && totalMatches > 0 && !hasGroupMatches;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await generateRoundRobinFixture(tournamentId, categoryId);
      setDone(true);
      setTimeout(() => {
        setIsOpen(false);
        setDone(false);
        if (onUpdate) onUpdate();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar TODOS los partidos programados? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await deleteAllMatchesFromTournament(tournamentId, categoryId);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al eliminar.");
      alert(err.message || "Ocurrió un error al eliminar.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading) {
      setIsOpen(false);
      setErrorMsg("");
      setDone(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {!hasGroupMatches ? (
        <button
          onClick={() => canGenerate && setIsOpen(true)}
          disabled={!canGenerate}
          className={`w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all touch-manipulation
            ${canGenerate
              ? "bg-gradient-to-r from-[#00f0ff]/10 to-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95"
              : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
            }`}
        >
          <Calendar size={16} />
          Crear calendario automático
        </button>
      ) : (
        <div className="flex gap-2 w-full">
          <div className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-lg font-bold uppercase tracking-widest text-[10px] bg-white/5 text-white/50 border border-white/10">
            <CheckCircle2 size={16} className="text-[#00aa66]" />
            Calendario creado
          </div>
          <button
            onClick={handleDelete}
            disabled={loading}
            title="Eliminar calendario"
            className="w-11 min-h-[44px] flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-all touch-manipulation active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      )}

      {/* Modal via Portal — oscurece toda la pantalla */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#040c1a] border border-[#00f0ff]/50 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,240,255,0.2)] relative overflow-hidden flex flex-col">
            {/* Top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00f0ff]/10 rounded-full blur-[50px]" />

            <div className="p-6 relative z-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center mb-4">
                <Calendar size={28} className="text-[#00f0ff]" />
              </div>

              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-1">
                Crear Calendario
              </h2>
              <p className="text-white/50 text-xs mb-6 leading-relaxed max-w-xs">
                Cada equipo jugará contra todos los demás. Los partidos se crean sin fecha — puedes agendarlos después.
              </p>

              {/* Stats */}
              <div className="w-full grid grid-cols-3 gap-2 mb-6">
                {[
                  { value: teamsCount, label: "Equipos" },
                  { value: numRounds, label: "Fechas" },
                  { value: totalMatches, label: "Partidos" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#00f0ff]/15 py-3 flex flex-col items-center gap-1 bg-[#001122]/60">
                    <span className="text-2xl font-black text-white">{item.value}</span>
                    <span className="text-[9px] text-[#00f0ff]/60 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="w-full text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center mb-4">
                  {errorMsg}
                </div>
              )}

              {/* Buttons */}
              <div className="flex w-full gap-3">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 py-3 text-xs font-bold text-white/70 bg-white/5 hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !canGenerate || done}
                  className="flex-1 py-3 text-xs font-bold rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 touch-manipulation active:scale-95 disabled:opacity-60"
                  style={{
                    background: done ? "#00aa66" : "#00f0ff",
                    color: "#000814",
                    boxShadow: done ? "0 0 15px rgba(0,170,102,0.4)" : "0 0 15px rgba(0,240,255,0.4)"
                  }}
                >
                  {loading && <><Loader2 size={14} className="animate-spin" /> Creando...</>}
                  {done && <><CheckCircle2 size={14} /> ¡Listo!</>}
                  {!loading && !done && "Crear Calendario"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
