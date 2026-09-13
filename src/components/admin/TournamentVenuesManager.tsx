"use client";

import { useState } from "react";
import { createTournamentVenue, deleteTournamentVenue } from "@/app/admin/actions";
import { CheckCircle2, Loader2, MapPin, Plus, Trash2 } from "lucide-react";

interface Venue {
  id: string;
  name: string;
  address?: string | null;
  surface?: string | null;
  court_type?: string | null;
  notes?: string | null;
  is_active?: boolean | null;
}

interface TournamentVenuesManagerProps {
  tournamentId: string;
  venues: Venue[];
  onUpdate?: () => void;
}

const fieldClass =
  "w-full rounded-xl border border-[#00f0ff]/15 bg-[#001122] text-white text-sm px-4 py-3 outline-none focus:border-[#00f0ff]/50 transition-colors placeholder:text-white/25";

export function TournamentVenuesManager({ tournamentId, venues, onUpdate }: TournamentVenuesManagerProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [surface, setSurface] = useState("");
  const [courtType, setCourtType] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const activeVenues = venues.filter((venue) => venue.is_active !== false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setDone(false);
    setError("");

    try {
      await createTournamentVenue({
        tournament_id: tournamentId,
        name,
        address,
        surface,
        court_type: courtType,
      });
      setName("");
      setAddress("");
      setSurface("");
      setCourtType("");
      setDone(true);
      onUpdate?.();
      setTimeout(() => setDone(false), 1800);
    } catch (err: any) {
      setError(err.message || "Error guardando la cancha.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: string) => {
    setRemovingId(venueId);
    setError("");

    try {
      await deleteTournamentVenue(venueId);
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || "Error quitando la cancha.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-1">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1 mb-1.5 block">
            Cancha
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cancha 1"
            className={fieldClass}
          />
        </div>
        <div className="md:col-span-1">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1 mb-1.5 block">
            Dirección
          </label>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Sede principal"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1 mb-1.5 block">
            Superficie
          </label>
          <input
            value={surface}
            onChange={(event) => setSurface(event.target.value)}
            placeholder="Sintética, madera..."
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1 mb-1.5 block">
            Tipo
          </label>
          <input
            value={courtType}
            onChange={(event) => setCourtType(event.target.value)}
            placeholder="Fútbol 7, voleibol..."
            className={fieldClass}
          />
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={loading || !name.trim()}
        className="min-h-[46px] rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00f0ff]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : done ? <CheckCircle2 size={15} /> : <Plus size={15} />}
        {loading ? "Guardando..." : done ? "Cancha creada" : "Agregar cancha"}
      </button>

      {activeVenues.length === 0 ? (
        <div className="py-8 text-center text-xs text-white/30 uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
          Todavía no hay canchas para este torneo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeVenues.map((venue) => (
            <div key={venue.id} className="rounded-xl border border-[#00f0ff]/10 bg-[#001122]/50 p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg border border-[#00f0ff]/20 bg-[#00f0ff]/10 shrink-0">
                <MapPin size={15} className="text-[#00f0ff]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-wider text-white truncate">{venue.name}</p>
                <p className="text-[11px] text-white/45 mt-1 truncate">
                  {[venue.address, venue.surface, venue.court_type].filter(Boolean).join(" · ") || "Sin detalles adicionales"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(venue.id)}
                disabled={removingId === venue.id}
                className="w-9 h-9 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500/20 transition-colors disabled:opacity-50"
                title="Quitar cancha"
              >
                {removingId === venue.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
