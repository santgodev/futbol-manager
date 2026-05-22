"use client";

import { useState } from "react";
import { createMatch } from "@/app/admin/actions";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function MatchCreator({ tournamentId, teams }: { tournamentId: string, teams: any[] }) {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [stage, setStage] = useState("GROUP");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return;
    setLoading(true);
    try {
      await createMatch({
        tournament_id: tournamentId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        stage,
        match_date: matchDate || null,
        match_time: matchTime || null,
        is_knockout: stage !== "GROUP"
      });
      router.refresh();
      // Reset
      setHomeTeamId("");
      setAwayTeamId("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-premium mb-12">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-6">Programar Nuevo Partido</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        
        <div className="flex flex-col gap-1 lg:col-span-1">
          <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Fase</span>
          <select 
            value={stage} 
            onChange={e => setStage(e.target.value)} 
            className="select-premium !p-2 !text-[10px]"
          >
            <option value="GROUP">GRUPOS</option>
            <option value="QUARTERFINAL">CUARTOS</option>
            <option value="SEMIFINAL">SEMIFINAL</option>
            <option value="FINAL">FINAL</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 lg:col-span-1">
          <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Local</span>
          <select 
            value={homeTeamId} 
            onChange={e => setHomeTeamId(e.target.value)} 
            className="select-premium !p-2 !text-[10px]"
          >
            <option value="">SELECCIONAR...</option>
            {teams.map(tt => (
              <option key={tt.team_id} value={tt.team_id}>{tt.team?.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 lg:col-span-1">
          <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Visitante</span>
          <select 
            value={awayTeamId} 
            onChange={e => setAwayTeamId(e.target.value)} 
            className="select-premium !p-2 !text-[10px]"
          >
            <option value="">SELECCIONAR...</option>
            {teams.map(tt => (
              <option key={tt.team_id} value={tt.team_id}>{tt.team?.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 lg:col-span-1">
          <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Fecha</span>
          <input 
            type="date" 
            value={matchDate}
            onChange={e => setMatchDate(e.target.value)}
            className="input-premium !p-2 !text-[10px]"
          />
        </div>

        <div className="flex flex-col gap-1 lg:col-span-1">
          <span className="text-[8px] text-brand-aqua/50 uppercase tracking-widest font-bold">Hora</span>
          <input 
            type="time" 
            value={matchTime}
            onChange={e => setMatchTime(e.target.value)}
            className="input-premium !p-2 !text-[10px]"
          />
        </div>

        <button 
          onClick={handleCreate}
          disabled={loading || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId}
          className="btn-premium-teal !py-2 !px-4 !text-[10px] h-[36px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Programar
        </button>
      </div>
    </div>
  );
}
