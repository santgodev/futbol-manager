"use client";

import { useState } from "react";
import { createMatch } from "@/app/admin/actions";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const inputClass = "w-full bg-[#040c1a]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] px-3 py-2.5 text-white text-xs rounded-lg outline-none transition-all appearance-none";

export function MatchCreator({ tournamentId, teams }: { tournamentId: string; teams: any[] }) {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [stage, setStage] = useState("GROUP");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchTime, setMatchTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  const canCreate = homeTeamId && awayTeamId && homeTeamId !== awayTeamId;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    setErrorMessage("");
    try {
      await createMatch({
        tournament_id: tournamentId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        stage,
        match_date: matchDate || null,
        match_time: matchTime || null,
        is_knockout: stage !== "GROUP",
      });
      router.refresh();
      setHomeTeamId("");
      setAwayTeamId("");
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">

      {/* Fase */}
      <div className="flex flex-col gap-1.5 col-span-1">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#00f0ff]/70 font-bold">Fase</label>
        <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
          <option value="GROUP"         className="bg-[#040c1a]">Grupos</option>
          <option value="ROUND_16"      className="bg-[#040c1a]">Octavos</option>
          <option value="QUARTERFINAL"  className="bg-[#040c1a]">Cuartos</option>
          <option value="SEMIFINAL"     className="bg-[#040c1a]">Semifinal</option>
          <option value="FINAL"         className="bg-[#040c1a]">Final</option>
        </select>
      </div>

      {/* Local */}
      <div className="flex flex-col gap-1.5 col-span-1">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#00f0ff]/70 font-bold">Local</label>
        <select value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)} className={inputClass}>
          <option value="">Equipo local...</option>
          {teams.map(tt => (
            <option key={tt.team_id} value={tt.team_id} className="bg-[#040c1a]">{tt.team?.name}</option>
          ))}
        </select>
      </div>

      {/* Visitante */}
      <div className="flex flex-col gap-1.5 col-span-1">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#00f0ff]/70 font-bold">Visitante</label>
        <select value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)} className={inputClass}>
          <option value="">Equipo visitante...</option>
          {teams.map(tt => (
            <option key={tt.team_id} value={tt.team_id} className="bg-[#040c1a]">{tt.team?.name}</option>
          ))}
        </select>
      </div>

      {/* Fecha */}
      <div className="flex flex-col gap-1.5 col-span-1">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#00f0ff]/70 font-bold">Fecha</label>
        <input
          type="date"
          value={matchDate}
          onChange={e => setMatchDate(e.target.value)}
          className={inputClass + " [color-scheme:dark]"}
        />
      </div>

      {/* Hora */}
      <div className="flex flex-col gap-1.5 col-span-1">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#00f0ff]/70 font-bold">Hora</label>
        <input
          type="time"
          value={matchTime}
          onChange={e => setMatchTime(e.target.value)}
          className={inputClass + " [color-scheme:dark]"}
        />
      </div>

      {/* Botón */}
      <div className="flex flex-col gap-1.5 col-span-1">
        <label className="text-[10px] uppercase tracking-[0.15em] text-transparent select-none">.</label>
        <button
          onClick={handleCreate}
          disabled={loading || !canCreate}
          className="w-full bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-[0_0_20px_rgba(0,170,255,0.4)] transition-all"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Crear
        </button>
      </div>
      
      {/* Mensaje de Error */}
      {errorMessage && (
        <div className="col-span-full mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
