"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { generateKnockoutBracket } from "@/app/admin/actions";
import { Trophy, Loader2, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BracketGeneratorProps {
  tournamentId: string;
  isGroupStageComplete: boolean;
  pendingGroupMatchesCount: number;
  registeredTeamsCount: number;
  matchesPlayed: number;
}

function getPhaseDescription(num: number): string {
  switch (num) {
    case 2: return "Solo se jugará la Gran Final (1.º contra 2.º).";
    case 4: return "2 semifinales (1.º vs 4.º y 2.º vs 3.º) y la Gran Final.";
    case 8: return "Cuartos de final, semifinales y Gran Final.";
    default: return "";
  }
}

export function BracketGenerator({
  tournamentId,
  isGroupStageComplete,
  pendingGroupMatchesCount,
  registeredTeamsCount,
  matchesPlayed
}: BracketGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const availableOptions = [2, 4, 8].filter(num => num <= registeredTeamsCount);
  const [teamsCount, setTeamsCount] = useState<2 | 4 | 8>(
    (availableOptions.includes(4) ? 4 : (availableOptions[0] || 2)) as 2 | 4 | 8
  );
  const router = useRouter();

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMessage("");
    try {
      await generateKnockoutBracket(tournamentId, teamsCount);
      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Ocurrió un error. Inténtalo de nuevo.");
    }
  };

  const closeModal = () => {
    if (status !== "generating") {
      setIsOpen(false);
      setErrorMessage("");
      if (status !== "success") setStatus("idle");
    }
  };

  // ── Fase de grupos incompleta ──
  if (!isGroupStageComplete) {
    const requiredGroupMatches = registeredTeamsCount >= 2
      ? (registeredTeamsCount * (registeredTeamsCount - 1)) / 2
      : 0;
    const progress = requiredGroupMatches > 0
      ? Math.min(100, Math.round((matchesPlayed / requiredGroupMatches) * 100))
      : 0;

    return (
      <div className="flex flex-col items-center justify-center p-6 py-10 rounded-2xl border border-amber-500/20 text-center relative overflow-hidden bg-[#040c1a]/60">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-base font-black text-white uppercase tracking-widest mb-1">
          Todavía hay partidos pendientes
        </h3>
        <p className="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold mb-4">
          Completa la fase grupal primero
        </p>

        <p className="text-white/50 text-xs max-w-xs mb-5 leading-relaxed">
          Faltan <strong className="text-white">{requiredGroupMatches - matchesPlayed}</strong> partidos de grupos por jugar. Cuando todos terminen, podrás iniciar la fase eliminatoria.
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-widest mb-1.5">
            <span>Progreso de grupos</span>
            <span className="text-amber-400">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          disabled
          className="mt-5 min-h-[48px] px-8 rounded-xl bg-white/5 border border-white/10 text-white/30 text-xs font-black uppercase tracking-widest cursor-not-allowed"
        >
          🔒 Fase Eliminatoria
        </button>
      </div>
    );
  }

  // ── Trigger: fase lista ──
  return (
    <>
      <div
        className="flex flex-col items-center justify-center p-8 py-10 rounded-2xl border border-[#00f0ff]/15 relative overflow-hidden group cursor-pointer bg-[#040c1a]/60 hover:border-[#00f0ff]/30 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#00f0ff]/3" />

        <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,240,255,0.15)] group-hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all">
          <Trophy className="w-8 h-8 text-[#00f0ff]" />
        </div>

        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
          ¡Fase de Grupos Completa!
        </h3>
        <p className="text-[#00f0ff]/60 text-xs mb-6 max-w-xs text-center leading-relaxed">
          Ya puedes iniciar la fase eliminatoria. Los cruces se armarán automáticamente según la clasificación.
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
          className="min-h-[48px] px-8 rounded-xl border-2 border-[#00f0ff] text-[#00f0ff] font-black uppercase tracking-widest text-sm hover:bg-[#00f0ff] hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] active:scale-95 touch-manipulation"
        >
          Iniciar Eliminatorias
        </button>
      </div>

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
                <Trophy size={28} className="text-[#00f0ff]" />
              </div>

              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-1">
                Iniciar Eliminatorias
              </h2>
              <p className="text-white/50 text-xs mb-6 leading-relaxed">
                ¿Cuántos equipos avanzan a la siguiente fase?
              </p>

              {/* Team count selector */}
              <div className="w-full grid grid-cols-3 gap-3 mb-5">
                {availableOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => setTeamsCount(num as 2 | 4 | 8)}
                    className={`min-h-[72px] rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all touch-manipulation active:scale-95
                      ${teamsCount === num
                        ? "border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        : "border-white/10 bg-white/5 hover:border-[#00f0ff]/40"
                      }`}
                  >
                    <span className={`text-2xl font-black ${teamsCount === num ? "text-[#00f0ff]" : "text-white/50"}`}>
                      {num}
                    </span>
                    <span className={`text-[9px] uppercase tracking-widest font-bold ${teamsCount === num ? "text-white" : "text-white/30"}`}>
                      Equipos
                    </span>
                  </button>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-white/50 leading-relaxed mb-5 text-center px-2">
                {getPhaseDescription(teamsCount)}
                <br />
                <span className="text-white/30 text-[10px]">
                  Se tomarán los {teamsCount} primeros de la tabla actual.
                </span>
              </p>

              {/* Error */}
              {status === "error" && (
                <div className="w-full text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2 mb-4 text-left">
                  <AlertTriangle size={14} className="shrink-0" /> {errorMessage}
                </div>
              )}

              {/* Buttons */}
              <div className="flex w-full gap-3">
                <button
                  onClick={closeModal}
                  disabled={status === "generating"}
                  className="flex-1 py-3 text-xs font-bold text-white/70 bg-white/5 hover:bg-white/10 rounded-lg uppercase tracking-widest transition-colors touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={status === "generating" || status === "success"}
                  className="flex-1 py-3 text-xs font-bold rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 touch-manipulation active:scale-95 disabled:opacity-60"
                  style={{
                    background: status === "success" ? "#00aa66" : "#00f0ff",
                    color: "#000814",
                    boxShadow: status === "success" ? "0 0 15px rgba(0,170,102,0.4)" : "0 0 15px rgba(0,240,255,0.4)"
                  }}
                >
                  {status === "generating" && <><Loader2 size={14} className="animate-spin" /> Armando...</>}
                  {status === "success" && <><CheckCircle2 size={14} /> ¡Listo!</>}
                  {(status === "idle" || status === "error") && "Confirmar"}
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
