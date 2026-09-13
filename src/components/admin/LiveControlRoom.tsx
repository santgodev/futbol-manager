"use client";

import { useState } from "react";
import { updateMatchScore, createMatchEvent, createPlayer, deleteMatchEvent } from "@/app/admin/actions";
import { Shield, CheckCircle, Plus, Trash2, Goal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function LiveControlRoom({ match, onUpdate }: { match: any, homePlayers?: any[], awayPlayers?: any[], onUpdate?: () => void }) {
  const router = useRouter();
  
  const [homeScore, setHomeScore] = useState(match.home_score || 0);
  const [awayScore, setAwayScore] = useState(match.away_score || 0);
  
  const [playerName, setPlayerName] = useState("");
  const [activeModal, setActiveModal] = useState<{
    teamId: string;
    type: "GOAL" | "YELLOW_CARD" | "RED_CARD";
  } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const handleFinalizeMatch = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await updateMatchScore(
        match.id,
        homeScore,
        awayScore,
        match.tournament_id,
        match.version || 1,
        match.home_penalty_score,
        match.away_penalty_score,
        'FINISHED'
      );
      router.push(`/admin/tournaments/${match.tournament_id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al finalizar el partido");
      setIsSubmitting(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      let playerId = null;
      if (playerName.trim()) {
        const res = await createPlayer({
           team_id: activeModal.teamId,
           name: playerName.trim(),
        });
        playerId = res.player.id;
      }

      await createMatchEvent({
         match_id: match.id,
         tournament_id: match.tournament_id,
         team_id: activeModal.teamId,
         player_id: playerId,
         type: activeModal.type,
         minute: null,
         description: playerName.trim() ? null : 'Jugador Desconocido'
      });

      if (activeModal.type === 'GOAL') {
        if (activeModal.teamId === match.home_team_id) {
          setHomeScore(s => s + 1);
        } else {
          setAwayScore(s => s + 1);
        }
      }

      setPlayerName("");
      setActiveModal(null);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al agregar el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    setIsSubmitting(true);
    try {
      await deleteMatchEvent(eventId, match.tournament_id);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al eliminar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040c1a] text-white font-sans flex flex-col relative overflow-hidden pb-12">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0066cc]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ff0055]/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="px-6 py-4 flex items-center justify-between border-b border-[#0055cc]/30 bg-[#02060d]/90 backdrop-blur-md relative z-20">
        <Link href={`/admin/tournaments/${match.tournament_id}`} className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
          <Shield size={18} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Volver al Torneo</span>
        </Link>
        <span className="text-[10px] text-[#00f0ff]/50 font-mono tracking-widest bg-[#00f0ff]/10 px-3 py-1 rounded-full border border-[#00f0ff]/20">INGRESO DIRECTO</span>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center relative z-10 max-w-4xl mx-auto w-full gap-6">
        
        {/* SCOREBOARD UNIFIED FORM */}
        <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full flex flex-col gap-8">
          <h2 className="text-center text-[#00f0ff] font-black uppercase tracking-[0.2em] text-sm">Control de Partido</h2>
          
          <div className="flex items-start justify-center gap-4 md:gap-16">
            {/* Local */}
            <div className="flex flex-col items-center gap-4 text-center w-40 md:w-56">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#001122] rounded-2xl border border-[#0055cc]/30 p-2 shadow-inner flex items-center justify-center overflow-hidden">
                {match.home_team?.logo_url ? (
                  <Image src={match.home_team.logo_url} alt="Local" width={80} height={80} className="object-contain" unoptimized />
                ) : <Shield className="w-8 h-8 text-[#0055cc]/40" />}
              </div>
              <span className="text-sm md:text-lg font-black uppercase tracking-tighter truncate w-full">
                {match.home_team?.name || 'Local'}
              </span>
              
              <div className="flex items-center gap-3 bg-[#001122]/60 border border-[#00f0ff]/20 rounded-2xl p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <button 
                  onClick={() => setHomeScore(s => Math.max(0, s - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xl font-black transition-colors"
                >
                  -
                </button>
                <div className="w-12 md:w-16 text-center text-4xl md:text-5xl font-black text-white">
                  {homeScore}
                </div>
                <button 
                  onClick={() => setActiveModal({ teamId: match.home_team_id, type: 'GOAL' })}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] text-2xl font-black transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-[#00f0ff]/30"
                >
                  +
                </button>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button 
                  onClick={() => setActiveModal({ teamId: match.home_team_id, type: 'YELLOW_CARD' })}
                  className="flex-1 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex justify-center items-center gap-1 transition-all"
                >
                  <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px]" />
                </button>
                <button 
                  onClick={() => setActiveModal({ teamId: match.home_team_id, type: 'RED_CARD' })}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl flex justify-center items-center gap-1 transition-all"
                >
                  <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px]" />
                </button>
              </div>
            </div>
            
            <span className="text-4xl md:text-6xl font-black text-[#00f0ff]/30 mt-16 md:mt-24">-</span>
            
            {/* Visitante */}
            <div className="flex flex-col items-center gap-4 text-center w-40 md:w-56">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#001122] rounded-2xl border border-[#0055cc]/30 p-2 shadow-inner flex items-center justify-center overflow-hidden">
                {match.away_team?.logo_url ? (
                  <Image src={match.away_team.logo_url} alt="Visitante" width={80} height={80} className="object-contain" unoptimized />
                ) : <Shield className="w-8 h-8 text-[#0055cc]/40" />}
              </div>
              <span className="text-sm md:text-lg font-black uppercase tracking-tighter truncate w-full">
                {match.away_team?.name || 'Visitante'}
              </span>
              
              <div className="flex items-center gap-3 bg-[#001122]/60 border border-[#00f0ff]/20 rounded-2xl p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <button 
                  onClick={() => setAwayScore(s => Math.max(0, s - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xl font-black transition-colors"
                >
                  -
                </button>
                <div className="w-12 md:w-16 text-center text-4xl md:text-5xl font-black text-white">
                  {awayScore}
                </div>
                <button 
                  onClick={() => setActiveModal({ teamId: match.away_team_id, type: 'GOAL' })}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] text-2xl font-black transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-[#00f0ff]/30"
                >
                  +
                </button>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button 
                  onClick={() => setActiveModal({ teamId: match.away_team_id, type: 'YELLOW_CARD' })}
                  className="flex-1 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex justify-center items-center gap-1 transition-all"
                >
                  <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px]" />
                </button>
                <button 
                  onClick={() => setActiveModal({ teamId: match.away_team_id, type: 'RED_CARD' })}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl flex justify-center items-center gap-1 transition-all"
                >
                  <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px]" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-[#0055cc]/20">
            <button 
              onClick={handleFinalizeMatch}
              disabled={isSubmitting}
              className="h-14 px-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black text-emerald-400 font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] disabled:opacity-50"
            >
              <CheckCircle size={20} /> Guardar Resultado Final
            </button>
          </div>
        </div>

        {/* EVENTS LIST (ANOTACIONES) */}
        <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff] mb-4">Anotaciones del Partido</h3>
           
           <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
              {match.match_events?.map((ev: any) => {
                 let evName = "GOL";
                 let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                 if (ev.type === 'YELLOW_CARD') { evName = "AMARILLA"; colorClass = "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"; }
                 if (ev.type === 'RED_CARD') { evName = "ROJA"; colorClass = "text-red-400 bg-red-500/10 border-red-500/30"; }
                 
                 const isHome = ev.team_id === match.home_team_id;

                 return (
                   <div key={ev.id} className="flex items-center justify-between bg-[#000814]/80 border border-white/5 p-3.5 rounded-xl hover:border-[#0055cc]/30 transition-all group">
                      <div className="flex items-center gap-3">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${colorClass}`}>{evName}</span>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-white uppercase tracking-wider">{ev.player?.name || ev.description || 'Desconocido'}</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-widest">{isHome ? match.home_team?.name : match.away_team?.name}</span>
                         </div>
                      </div>
                      <button onClick={() => handleDeleteEvent(ev.id)} disabled={isSubmitting} className="text-red-500 opacity-50 hover:opacity-100 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/20 transition-all" title="Eliminar">
                         <Trash2 size={16} />
                      </button>
                   </div>
                 )
              })}

              {(!match.match_events || match.match_events.length === 0) && (
                 <div className="text-center py-12 text-[10px] font-bold text-white/20 uppercase tracking-widest border border-dashed border-white/10 rounded-xl bg-white/5">
                    No hay goles ni eventos registrados
                 </div>
              )}
           </div>
        </div>

      </div>

      {/* EVENT CREATION MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#02060d] border border-[#00f0ff]/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-sm flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#00f0ff] font-black uppercase tracking-[0.1em] text-sm flex items-center gap-2">
                  {activeModal.type === 'GOAL' && <Goal size={16} />}
                  {activeModal.type === 'YELLOW_CARD' && <div className="w-3 h-4 bg-yellow-400 rounded-sm" />}
                  {activeModal.type === 'RED_CARD' && <div className="w-3 h-4 bg-red-500 rounded-sm" />}
                  Añadir {activeModal.type === 'GOAL' ? 'Gol' : activeModal.type === 'YELLOW_CARD' ? 'Amarilla' : 'Roja'}
                </h3>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
                  Para: {activeModal.teamId === match.home_team_id ? match.home_team?.name : match.away_team?.name}
                </p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-white/70 uppercase tracking-widest font-bold">Nombre del Jugador</label>
                <input 
                  type="text" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ej: Lionel Messi (Opcional)"
                  autoFocus
                  className="w-full bg-[#001122] border border-[#0055cc]/50 p-3.5 rounded-xl text-white font-bold focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/50 transition-all placeholder:text-white/20"
                />
                <span className="text-[8px] text-white/30 uppercase tracking-widest">
                  Si dejas este campo vacío, se registrará como &quot;Desconocido&quot;.
                </span>
              </div>

              {errorMsg && <p className="text-red-400 text-[10px] font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{errorMsg}</p>}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
