"use client";

import { useState } from "react";
import { X, Activity, Goal, TriangleAlert } from "lucide-react";

interface FastEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string | null) => Promise<void>;
  teamName: string;
  eventType: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD";
}

export function FastEventModal({ isOpen, onClose, onSubmit, teamName, eventType }: FastEventModalProps) {
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit(playerName.trim() || null);
      setPlayerName("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrar el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventLabel = () => {
    switch (eventType) {
      case "GOAL": return "Anotar Gol";
      case "OWN_GOAL": return "Autogol";
      case "YELLOW_CARD": return "Tarjeta Amarilla";
      case "RED_CARD": return "Tarjeta Roja";
      default: return "Registrar Evento";
    }
  };

  const getEventIcon = () => {
    switch (eventType) {
      case "GOAL": return <Goal size={24} className="text-brand-primary" />;
      case "OWN_GOAL": return <Goal size={24} className="text-orange-500" />;
      case "YELLOW_CARD": return <div className="w-4 h-6 rounded-sm bg-yellow-400 rotate-12 shadow-sm" />;
      case "RED_CARD": return <div className="w-4 h-6 rounded-sm bg-red-500 rotate-12 shadow-sm" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#0B1120] border border-[#1E293B] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#0F172A]">
          <div className="flex items-center gap-3">
            {getEventIcon()}
            <div>
              <h3 className="text-zinc-100 font-semibold">{getEventLabel()}</h3>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{teamName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
              <TriangleAlert size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nombre del Jugador <span className="text-zinc-500 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              autoFocus
              className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all shadow-sm"
            />
            <p className="text-[11px] text-zinc-500 mt-2">
              Si ingresas un nombre, se creará el jugador automáticamente y se le asignará el evento. Si lo dejas vacío, el evento se asignará al equipo sin un jugador específico.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-xs font-semibold tracking-wide bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Activity size={14} className="animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Evento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
