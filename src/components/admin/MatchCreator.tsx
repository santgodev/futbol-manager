"use client";

import { useState } from "react";
import { createMatch } from "@/app/admin/actions";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
      <div className="py-8 text-center text-xs text-brand-aqua/30 uppercase tracking-widest">
        Necesitas inscribir al menos 2 equipos para programar un partido.
      </div>
    );
  }

  return (
    <div className="panel-premium mb-12">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-teal to-brand-gold opacity-50" />
      
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-sand mb-6">Programar Nuevo Partido</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        
        {/* Fase */}
        <div className="flex flex-col gap-1 col-span-1">
          <label className="text-[9px] uppercase tracking-widest text-brand-aqua/60 font-bold">Fase</label>
          <select 
            value={stage} 
            onChange={e => setStage(e.target.value)} 
            className="select-premium !p-2 !text-[10px]"
          >
            <option value="GROUP" className="bg-black">Grupos</option>
            <option value="ROUND_16" className="bg-black">Octavos</option>
            <option value="QUARTERFINAL" className="bg-black">Cuartos</option>
            <option value="SEMIFINAL" className="bg-black">Semifinal</option>
            <option value="FINAL" className="bg-black">Final</option>
          </select>
        </div>

        {/* Local */}
        <div className="flex flex-col gap-1 col-span-1">
          <label className="text-[9px] uppercase tracking-widest text-brand-aqua/60 font-bold">Local</label>
          <select 
            value={homeTeamId} 
            onChange={e => setHomeTeamId(e.target.value)} 
            className="select-premium !p-2 !text-[10px]"
          >
            <option value="" className="bg-black">Equipo local...</option>
            {teams.map(tt => (
              <option key={tt.team_id} value={tt.team_id} className="bg-black">{tt.team?.name}</option>
            ))}
          </select>
        </div>

        {/* Visitante */}
        <div className="flex flex-col gap-1 col-span-1">
          <label className="text-[9px] uppercase tracking-widest text-brand-aqua/60 font-bold">Visitante</label>
          <select 
            value={awayTeamId} 
            onChange={e => setAwayTeamId(e.target.value)} 
            className="select-premium !p-2 !text-[10px]"
          >
            <option value="" className="bg-black">Equipo visitante...</option>
            {teams.map(tt => (
              <option key={tt.team_id} value={tt.team_id} className="bg-black">{tt.team?.name}</option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-1 col-span-1">
          <label className="text-[9px] uppercase tracking-widest text-brand-aqua/60 font-bold">Fecha</label>
          <input 
            type="date" 
            value={matchDate}
            onChange={e => setMatchDate(e.target.value)}
            className="input-premium !p-2 !text-[10px] [color-scheme:dark]"
          />
        </div>

        {/* Hora */}
        <div className="flex flex-col gap-1 col-span-1">
          <label className="text-[9px] uppercase tracking-widest text-brand-aqua/60 font-bold">Hora</label>
          <input 
            type="time" 
            value={matchTime}
            onChange={e => setMatchTime(e.target.value)}
            className="input-premium !p-2 !text-[10px] [color-scheme:dark]"
          />
        </div>

        {/* Botón */}
        <div className="flex flex-col gap-1 col-span-1">
          <button
            onClick={handleCreate}
            disabled={loading || !canCreate}
            className="btn-premium-teal w-full !py-2.5 !px-4 !text-[10px] h-[36px]"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Crear Partido
          </button>
        </div>
        
        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="col-span-full mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
