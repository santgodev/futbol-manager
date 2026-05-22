"use client";
import { useState, useEffect } from "react";
import { updateMatchScore } from "@/app/admin/actions";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function MatchEditor({ match, tournamentId }: { match: any, tournamentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(match.home_score ?? "");
  const [awayScore, setAwayScore] = useState(match.away_score ?? "");
  const [homePenalty, setHomePenalty] = useState(match.home_penalty_score ?? "");
  const [awayPenalty, setAwayPenalty] = useState(match.away_penalty_score ?? "");
  const [matchStatus, setMatchStatus] = useState(match.status || 'SCHEDULED');
  const [version, setVersion] = useState(match.version ?? 1);
  
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => setStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleUpdate = async (isFinalizing: boolean = false) => {
    setStatus("saving");
    try {
      const targetStatus = isFinalizing ? 'FINISHED' : 'SCHEDULED';
      const result = await updateMatchScore(
        match.id, 
        homeScore === "" ? null : Number(homeScore), 
        awayScore === "" ? null : Number(awayScore),
        tournamentId,
        version,
        homePenalty === "" ? null : Number(homePenalty),
        awayPenalty === "" ? null : Number(awayPenalty),
        targetStatus
      );
      
      // La acción updateMatchScore ya pone status 'FINISHED' si hay goles. 
      // Para mayor claridad, lo forzamos en el estado local.
      setMatchStatus(isFinalizing ? 'FINISHED' : 'SCHEDULED');
      
      if (result?.newVersion) {
        setVersion(result.newVersion);
      }
      setStatus("success");
      
      if (isFinalizing) {
        // Pequeño delay para que el usuario vea el éxito antes de cerrar
        setTimeout(() => setIsOpen(false), 1500);
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Error al guardar");
    }
  };

  if (!isOpen) {
    const isFinished = matchStatus === 'FINISHED';
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className={`group p-6 border transition-all cursor-pointer flex items-center justify-between ${
          isFinished 
            ? 'bg-brand-navy/5 border-brand-navy/20 opacity-70' 
            : 'bg-brand-deep border-brand-navy/30 hover:border-brand-teal'
        }`}
      >
        <div className="flex items-center gap-6">
          <div className={`w-2 h-2 rounded-full ${isFinished ? 'bg-brand-navy' : 'bg-brand-teal animate-pulse'}`} />
          <div className="flex flex-col">
            <span className="text-[8px] text-brand-aqua/50 uppercase tracking-[0.2em] font-bold">
              {match.stage} • {isFinished ? 'FINALIZADO' : 'PENDIENTE'}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-black text-xl text-brand-sand uppercase tracking-tighter group-hover:text-white transition-colors">
                {match.home_team?.name || 'TBD'} <span className="text-brand-aqua/20">vs</span> {match.away_team?.name || 'TBD'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-3xl font-black text-brand-sand flex items-center gap-2 tabular-nums">
            <span>{homeScore || 0}</span>
            <span className="text-brand-aqua/20 text-xl">:</span>
            <span>{awayScore || 0}</span>
          </div>
          <Link 
            href={`/admin/matches/${match.id}`}
            className="bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-teal hover:text-brand-deep transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            Abrir Control Room
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="panel-premium-highlight flex flex-col">
      {/* Status Bar */}
      <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${
        status === 'saving' ? 'bg-yellow-500 animate-pulse' :
        status === 'success' ? 'bg-green-500' :
        status === 'error' ? 'bg-red-500' : 'bg-brand-teal'
      }`} />

      <div className="flex justify-between items-start mb-12">
         <div>
            <h4 className="text-[10px] text-brand-teal font-black uppercase tracking-[0.3em] mb-2">Editor de Encuentro</h4>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-white uppercase tracking-tighter">{match.stage}</span>
              <span className={`px-3 py-1 text-[9px] font-bold rounded-sm ${matchStatus === 'FINISHED' ? 'bg-brand-navy text-brand-aqua' : 'bg-brand-teal/20 text-brand-teal'}`}>
                {matchStatus === 'FINISHED' ? 'FINALIZADO' : 'EN VIVO / PROGRAMADO'}
              </span>
            </div>
         </div>
         <button onClick={() => setIsOpen(false)} className="text-brand-aqua/50 hover:text-white text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
            <span className="text-lg">×</span> Cerrar Editor
         </button>
      </div>

      <div className="flex items-center gap-12 mb-12">
        {/* Local */}
        <div className="flex-1 flex flex-col items-end gap-4">
          <span className="font-black text-2xl md:text-4xl text-brand-sand uppercase tracking-tighter text-right">
            {match.home_team?.name || 'TBD'}
          </span>
          {match.is_knockout && (
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-brand-aqua/40 uppercase font-bold mb-1">Penales</span>
              <input 
                type="number" 
                value={homePenalty}
                onChange={(e) => { setHomePenalty(e.target.value); setStatus("idle"); }}
                className="input-penalty"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Marcador Central */}
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            value={homeScore} 
            onChange={(e) => { setHomeScore(e.target.value); setStatus("idle"); }}
            className="input-score"
            placeholder="-"
          />
          <span className="text-brand-aqua/20 font-black text-4xl md:text-6xl">:</span>
          <input 
            type="number" 
            value={awayScore} 
            onChange={(e) => { setAwayScore(e.target.value); setStatus("idle"); }}
            className="input-score"
            placeholder="-"
          />
        </div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-start gap-4">
          <span className="font-black text-2xl md:text-4xl text-brand-sand uppercase tracking-tighter text-left">
            {match.away_team?.name || 'TBD'}
          </span>
          {match.is_knockout && (
            <div className="flex flex-col items-start">
              <span className="text-[9px] text-brand-aqua/40 uppercase font-bold mb-1">Penales</span>
              <input 
                type="number" 
                value={awayPenalty}
                onChange={(e) => { setAwayPenalty(e.target.value); setStatus("idle"); }}
                className="input-penalty"
                placeholder="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-8 border-t border-brand-navy/30">
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="text-[10px] text-brand-aqua/30 hover:text-brand-teal uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          {showLogs ? 'Ocultar Historial' : `Ver Historial de Cambios (${match.match_logs?.length || 0})`}
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleUpdate(false)} 
            disabled={status === 'saving'}
            className="btn-premium-navy !py-4"
          >
            Guardar Parcial
          </button>
          
          <button 
            onClick={() => handleUpdate(true)} 
            disabled={status === 'saving'}
            className="btn-premium-teal !py-4 shadow-[0_0_30px_rgba(35,210,203,0.3)]"
          >
            {status === 'saving' ? 'Procesando...' : 'Finalizar Partido →'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
          <AlertTriangle className="w-4 h-4" /> {errorMessage}
        </div>
      )}

      {/* Historial */}
      {showLogs && (
        <div className="mt-8 bg-brand-navy/5 p-6 border border-brand-navy/20">
          <h5 className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mb-4">Registro de Auditoría</h5>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto custom-scrollbar">
            {match.match_logs?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between text-[11px] pb-2 border-b border-brand-navy/10 last:border-0">
                <span className="text-brand-aqua/40">{new Date(log.created_at).toLocaleString()}</span>
                <span className="font-mono text-brand-sand">{log.old_home_score}:{log.old_away_score} <span className="text-brand-teal">→</span> {log.new_home_score}:{log.new_away_score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
