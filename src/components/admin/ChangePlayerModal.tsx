"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { UserRound, Check, X, Search } from "lucide-react";
import Image from "next/image";
import type { MatchEvent } from "./EventContextMenu";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export interface RosterPlayer {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  team_id: string;
  photo_url?: string | null;
}

interface ChangePlayerModalProps {
  event: MatchEvent | null;
  matchId: string;
  tournamentId: string;
  /** Combined home + away rosters — the modal filters by event.team_id automatically */
  allPlayers: RosterPlayer[];
  onConfirm: (eventId: string, playerId: string, matchId: string, tournamentId: string) => Promise<void>;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export function ChangePlayerModal({
  event,
  matchId,
  tournamentId,
  allPlayers,
  onConfirm,
  onClose,
}: ChangePlayerModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Reset state on new event open
  useEffect(() => {
    if (event) {
      setSelectedPlayerId(null);
      setIsSaving(false);
      setError("");
      setSearch("");
    }
  }, [event?.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && !isSaving) onClose();
  }, [onClose, isSaving]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Only show players from the same team as the event
  const teamPlayers = useMemo(() => {
    if (!event) return [];
    return allPlayers
      .filter((p) => p.team_id === event.team_id)
      .sort((a, b) => (a.number ?? 999) - (b.number ?? 999));
  }, [allPlayers, event?.team_id]);

  // Search filter
  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return teamPlayers;
    return teamPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.number?.toString() ?? "").includes(q) ||
        (p.position?.toLowerCase() ?? "").includes(q)
    );
  }, [teamPlayers, search]);

  const handleSave = async () => {
    if (!event || !selectedPlayerId || isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      await onConfirm(event.id, selectedPlayerId, matchId, tournamentId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al cambiar el jugador.");
      setIsSaving(false);
    }
  };

  if (!event) return null;

  const currentPlayerId = event.player?.id;

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
          aria-labelledby="change-player-title"
          className="pointer-events-auto w-full max-w-sm bg-[#060f1f]/98 backdrop-blur-xl border border-[#0055cc]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(167,139,250,0.06)] overflow-hidden flex flex-col max-h-[80vh]"
          style={{ animation: "modalIn 140ms ease-out both" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Purple top stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#a78bfa]/0 via-[#a78bfa] to-[#a78bfa]/0 shrink-0" />

          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/25 flex items-center justify-center shrink-0">
                <UserRound size={14} className="text-[#a78bfa]" />
              </div>
              <div>
                <h2 id="change-player-title" className="text-sm font-black uppercase tracking-[0.08em] text-white">
                  Cambiar Jugador
                </h2>
                <p className="text-[10px] text-white/35 uppercase tracking-widest">
                  Jugadores del mismo equipo
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

          {/* Current player chip */}
          <div className="px-5 pb-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#001122]/50 border border-[#0055cc]/20">
              <span className="text-[9px] text-white/30 uppercase tracking-widest shrink-0">Actual:</span>
              <span className="text-xs font-bold text-white/60 truncate">
                {event.player?.name ?? "Sin jugador"}{event.player?.number ? ` (#${event.player.number})` : ""}
              </span>
            </div>
          </div>

          {/* Search */}
          {teamPlayers.length > 5 && (
            <div className="px-5 pb-3 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o dorsal..."
                  className="w-full bg-[#001122]/60 border border-[#0055cc]/25 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#a78bfa]/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Player list — scrollable */}
          <div className="px-5 pb-3 flex-1 overflow-y-auto custom-scrollbar">
            {filteredPlayers.length === 0 ? (
              <div className="py-8 text-center">
                <span className="text-[10px] text-white/25 uppercase tracking-widest">
                  {search ? "Sin resultados" : "No hay jugadores disponibles"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filteredPlayers.map((player) => {
                  const isCurrent = player.id === currentPlayerId;
                  const isSelected = player.id === selectedPlayerId;
                  return (
                    <button
                      key={player.id}
                      onClick={() => !isCurrent && setSelectedPlayerId(player.id)}
                      disabled={isCurrent || isSaving}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left
                        transition-all duration-100
                        ${isCurrent
                          ? "bg-[#001122]/30 border-white/5 opacity-40 cursor-default"
                          : isSelected
                            ? "bg-[#a78bfa]/15 border-[#a78bfa]/50 shadow-[0_0_12px_rgba(167,139,250,0.15)]"
                            : "bg-[#001122]/40 border-[#0055cc]/15 hover:bg-[#001122]/70 hover:border-[#a78bfa]/30"
                        }
                        focus:outline-none focus-visible:ring-1 focus-visible:ring-[#a78bfa]/50
                      `}
                      aria-pressed={isSelected}
                    >
                      {/* Avatar / number */}
                      <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {player.photo_url ? (
                          <Image src={player.photo_url} alt={player.name} width={32} height={32} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <span className="text-[10px] text-white/50 font-mono">{player.number ?? "?"}</span>
                        )}
                      </div>

                      {/* Name + position */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-white uppercase truncate leading-tight">
                          {player.name}
                        </span>
                        <span className="text-[9px] text-white/35">
                          #{player.number ?? "—"} {player.position ? `· ${player.position}` : ""}
                        </span>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#a78bfa] flex items-center justify-center shrink-0">
                          <Check size={10} className="text-black" />
                        </div>
                      )}
                      {isCurrent && (
                        <span className="text-[8px] text-white/25 uppercase tracking-widest shrink-0">actual</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25">
              <p className="text-[10px] text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 pb-5 pt-2 flex gap-2.5 shrink-0">
            <button
              onClick={() => { if (!isSaving) onClose(); }}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPlayerId || isSaving}
              className="flex-1 py-3 rounded-xl bg-[#a78bfa]/15 hover:bg-[#a78bfa] border border-[#a78bfa]/40 text-[#a78bfa] hover:text-black text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={14} />
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
