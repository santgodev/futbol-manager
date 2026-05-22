"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Clock, Check, X } from "lucide-react";
import type { MatchEvent } from "./EventContextMenu";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface EditMinuteModalProps {
  event: MatchEvent | null;
  matchId: string;
  tournamentId: string;
  onConfirm: (eventId: string, minute: number, matchId: string, tournamentId: string) => Promise<void>;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export function EditMinuteModal({ event, matchId, tournamentId, onConfirm, onClose }: EditMinuteModalProps) {
  const [minute, setMinute] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input with event minute when modal opens
  useEffect(() => {
    if (event) {
      setMinute(event.minute?.toString() ?? "");
      setIsSaving(false);
      setError("");
      // Auto-focus + select the input
      setTimeout(() => {
        inputRef.current?.select();
      }, 80);
    }
  }, [event?.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && !isSaving) onClose();
  }, [onClose, isSaving]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const validate = (): number | null => {
    const parsed = parseInt(minute, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 120) {
      setError("Ingresa un minuto válido entre 1 y 120.");
      return null;
    }
    return parsed;
  };

  const handleSave = async () => {
    if (!event || isSaving) return;
    const parsed = validate();
    if (parsed === null) return;
    setIsSaving(true);
    setError("");
    try {
      await onConfirm(event.id, parsed, matchId, tournamentId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el minuto.");
      setIsSaving(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  if (!event) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
        onClick={() => { if (!isSaving) onClose(); }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-minute-title"
          className="pointer-events-auto w-full max-w-xs bg-[#060f1f]/98 backdrop-blur-xl border border-[#0055cc]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(0,240,255,0.06)] overflow-hidden"
          style={{ animation: "modalIn 140ms ease-out both" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cyan top stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#00f0ff]/0 via-[#00f0ff] to-[#00f0ff]/0" />

          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/25 flex items-center justify-center shrink-0">
                <Clock size={14} className="text-[#00f0ff]" />
              </div>
              <div>
                <h2 id="edit-minute-title" className="text-sm font-black uppercase tracking-[0.08em] text-white">
                  Editar Minuto
                </h2>
                <p className="text-[10px] text-white/35 uppercase tracking-widest truncate max-w-[140px]">
                  {event.player?.name ?? "Evento"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { if (!isSaving) onClose(); }}
              disabled={isSaving}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-all disabled:opacity-30"
              aria-label="Cerrar"
            >
              <X size={13} />
            </button>
          </div>

          {/* Input */}
          <div className="px-5 pb-2">
            <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#00f0ff]/50 mb-2">
              Minuto del evento (1 – 120)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                min={1}
                max={120}
                value={minute}
                onChange={(e) => { setMinute(e.target.value); setError(""); }}
                onKeyDown={handleInputKeyDown}
                disabled={isSaving}
                placeholder="Ej: 45"
                className="
                  w-full bg-[#001122]/70 border border-[#0055cc]/30 rounded-xl
                  px-4 py-3.5 text-2xl font-black text-white text-center font-mono
                  placeholder:text-white/15
                  focus:outline-none focus:border-[#00f0ff]/60 focus:bg-[#001122]
                  focus:shadow-[0_0_0_3px_rgba(0,240,255,0.08)]
                  transition-all disabled:opacity-40
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                "
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00f0ff]/40 font-mono text-lg font-black pointer-events-none">
                '
              </span>
            </div>
            {error && (
              <p className="mt-2 text-[10px] text-red-400 leading-relaxed">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 pt-3 flex gap-2.5">
            <button
              onClick={() => { if (!isSaving) onClose(); }}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !minute}
              className="flex-1 py-3 rounded-xl bg-[#00f0ff]/15 hover:bg-[#00f0ff] border border-[#00f0ff]/40 text-[#00f0ff] hover:text-black text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Guardar
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
