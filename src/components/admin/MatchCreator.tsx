"use client";

import { useState } from "react";
import { createMatch } from "@/app/admin/actions";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MatchCreator({
  tournamentId,
  categoryId,
  teams,
  venues = [],
  onUpdate
}: {
  tournamentId: string;
  categoryId?: string | null;
  teams: any[];
  venues?: any[];
  onUpdate?: () => void;
}) {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [stage, setStage] = useState("GROUP");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchTime, setMatchTime] = useState("18:00");
  const [venueId, setVenueId] = useState("");
  const [customVenue, setCustomVenue] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const canCreate = homeTeamId && awayTeamId && homeTeamId !== awayTeamId;
  const activeVenues = venues.filter((venue) => venue.is_active !== false);

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    setDone(false);
    setErrorMessage("");
    try {
      await createMatch({
        tournament_id: tournamentId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        stage,
        match_date: matchDate || null,
        match_time: matchTime || null,
        venue_id: venueId || null,
        venue: venueId ? null : customVenue.trim() || null,
        is_knockout: stage !== "GROUP",
        category_id: categoryId || null,
      });
      setDone(true);
      setHomeTeamId("");
      setAwayTeamId("");
      setVenueId("");
      setCustomVenue("");
      if (onUpdate) onUpdate();
      router.refresh();
      setTimeout(() => setDone(false), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al crear el partido");
    } finally {
      setLoading(false);
    }
  };

  if (teams.length < 2) {
    return (
      <div className="py-8 text-center text-xs text-white/30 uppercase tracking-widest">
        Necesitas inscribir al menos 2 equipos para programar un partido.
      </div>
    );
  }

  const selectClass = "w-full rounded-xl border border-[#00f0ff]/15 bg-[#001122] text-white text-sm px-4 py-3 outline-none focus:border-[#00f0ff]/50 transition-colors appearance-none touch-manipulation min-h-[48px]";

  return (
    <div className="flex flex-col gap-4">

      {/* Row 1: Equipos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1">Equipo Local</label>
          <select
            value={homeTeamId}
            onChange={e => setHomeTeamId(e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-[#001122]">Seleccionar equipo...</option>
            {teams.map(tt => (
              <option key={tt.team_id} value={tt.team_id} className="bg-[#001122]" disabled={tt.team_id === awayTeamId}>
                {tt.team?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1">Equipo Visitante</label>
          <select
            value={awayTeamId}
            onChange={e => setAwayTeamId(e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-[#001122]">Seleccionar equipo...</option>
            {teams.map(tt => (
              <option key={tt.team_id} value={tt.team_id} className="bg-[#001122]" disabled={tt.team_id === homeTeamId}>
                {tt.team?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Fecha, Hora, Cancha y Fase */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1">Fecha</label>
          <input
            type="date"
            value={matchDate}
            onChange={e => setMatchDate(e.target.value)}
            className={`${selectClass} [color-scheme:dark]`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1">Hora</label>
          <input
            type="time"
            value={matchTime}
            onChange={e => setMatchTime(e.target.value)}
            className={`${selectClass} [color-scheme:dark]`}
          />
        </div>

        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1">Cancha</label>
          {activeVenues.length > 0 ? (
            <select
              value={venueId}
              onChange={e => {
                setVenueId(e.target.value);
                if (e.target.value) setCustomVenue("");
              }}
              className={selectClass}
            >
              <option value="" className="bg-[#001122]">Sin cancha fija</option>
              {activeVenues.map((venue) => (
                <option key={venue.id} value={venue.id} className="bg-[#001122]">
                  {venue.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={customVenue}
              onChange={e => setCustomVenue(e.target.value)}
              placeholder="Cancha / sede..."
              className={selectClass}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label className="text-[9px] uppercase tracking-[0.25em] text-[#00f0ff]/50 font-bold px-1">Etapa</label>
          <select
            value={stage}
            onChange={e => setStage(e.target.value)}
            className={selectClass}
          >
            <option value="GROUP" className="bg-[#001122]">Fase de Grupos</option>
            <option value="ROUND_16" className="bg-[#001122]">Octavos de Final</option>
            <option value="QUARTERFINAL" className="bg-[#001122]">Cuartos de Final</option>
            <option value="SEMIFINAL" className="bg-[#001122]">Semifinal</option>
            <option value="FINAL" className="bg-[#001122]">Gran Final</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleCreate}
        disabled={loading || !canCreate}
        className="w-full min-h-[52px] rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: done ? "#00aa66" : canCreate ? "#00f0ff" : "rgba(255,255,255,0.05)",
          color: canCreate ? "#000814" : "rgba(255,255,255,0.3)",
          border: canCreate ? "none" : "1px solid rgba(255,255,255,0.1)"
        }}
      >
        {loading && <><Loader2 size={18} className="animate-spin" /> Creando partido...</>}
        {done && <><CheckCircle2 size={18} /> ¡Partido creado!</>}
        {!loading && !done && <><Plus size={18} /> Agregar Partido</>}
      </button>
    </div>
  );
}
