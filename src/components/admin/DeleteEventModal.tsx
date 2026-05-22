"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Goal, Activity } from "lucide-react";
import type { MatchEvent } from "./EventContextMenu";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const EVENT_META: Record<string, { label: string; color: string; affectsScore: boolean }> = {
  GOAL:         { label: "Gol",              color: "text-emerald-400", affectsScore: true  },
  OWN_GOAL:     { label: "Autogol",          color: "text-orange-400",  affectsScore: true  },
  YELLOW_CARD:  { label: "Tarjeta Amarilla", color: "text-yellow-400",  affectsScore: false },
  RED_CARD:     { label: "Tarjeta Roja",     color: "text-red-400",     affectsScore: false },
  SUBSTITUTION: { label: "Cambio",           color: "text-[#00f0ff]",   affectsScore: false },
};

function EventIcon({ type }: { type: string }) {
  if (type === "YELLOW_CARD") return <div className="w-4 h-5 bg-yellow-400 rounded-sm shadow" />;
  if (type === "RED_CARD")    return <div className="w-4 h-5 bg-red-500 rounded-sm shadow" />;
  if (type === "SUBSTITUTION") return <Activity size={18} className="text-[#00f0ff]" />;
  if (type === "OWN_GOAL")    return <Goal size={18} className="text-orange-400" />;
  return <Goal size={18} className="text-emerald-400" />;
}

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────
interface DeleteEventModalProps {
  event: MatchEvent | null;
  tournamentId: string;
  onConfirm: (eventId: string, tournamentId: string) => Promise<void>;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export function DeleteEventModal({ event, tournamentId, onConfirm, onClose }: DeleteEventModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Reset state when event changes (new modal open)
  useEffect(() => {
    if (event) {
      setIsDeleting(false);
      setError("");
    }
  }, [event?.id]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && !isDeleting) onClose();
  }, [onClose, isDeleting]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleConfirm = async () => {
    if (!event || isDeleting) return;
    setIsDeleting(true);
    setError("");
    try {
      await onConfirm(event.id, tournamentId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al eliminar el evento. Inténtalo de nuevo.");
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  const meta = EVENT_META[event.type] ?? { label: event.type, color: "text-white", affectsScore: false };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm"
        onClick={() => { if (!isDeleting) onClose(); }}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-sm bg-[#060f1f]/98 backdrop-blur-xl border border-[#0055cc]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(0,240,255,0.06)] overflow-hidden"
          style={{ animation: "modalIn 150ms ease-out both" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top danger stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-red-600/0 via-red-500 to-red-600/0" />

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <div>
                <h2
                  id="delete-modal-title"
                  className="text-sm font-black uppercase tracking-[0.1em] text-white"
                >
                  Eliminar Evento
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={() => { if (!isDeleting) onClose(); }}
              disabled={isDeleting}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-all disabled:opacity-30"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          {/* Event preview card */}
          <div className="mx-6 mb-4 p-4 rounded-xl bg-[#001122]/60 border border-[#0055cc]/20 flex items-center gap-4">
            <div className="shrink-0">
              <EventIcon type={event.type} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-black uppercase tracking-wider ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-sm font-bold text-white truncate">
                {event.player?.name ?? "Jugador desconocido"}
              </span>
              <span className="text-[9px] font-mono text-[#00f0ff]/50">
                {event.minute ? `Minuto ${event.minute}'` : "Sin minuto registrado"}
              </span>
            </div>
          </div>

          {/* Warning — solo cuando afecta marcador */}
          {meta.affectsScore && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-300/90 leading-relaxed">
                <span className="font-bold text-amber-300">Marcador actualizado automáticamente.</span>
                {" "}Al eliminar este evento, el marcador del partido se recalculará y las tablas de posiciones y goleadores quedarán al día.
              </p>
            </div>
          )}

          {/* Neutral info — eventos sin efecto en marcador */}
          {!meta.affectsScore && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-[#001122]/40 border border-[#0055cc]/15 flex items-start gap-3">
              <AlertTriangle size={14} className="text-[#00f0ff]/60 mt-0.5 shrink-0" />
              <p className="text-[10px] text-white/50 leading-relaxed">
                Este evento no afecta el marcador del partido. Solo se eliminará del timeline.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-400 shrink-0" />
              <p className="text-[10px] text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => { if (!isDeleting) onClose(); }}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500 border border-red-500/50 text-red-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
}
