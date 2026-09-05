"use client";

import { useState, useEffect } from "react";
import { createMatchEvent, updateMatchScore, deleteMatchEvent, updateMatchEventFields } from "@/app/admin/actions";
import { Play, Pause, Square, AlertTriangle, Clock, Shield, Goal, UserMinus, UserPlus, Activity, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventContextMenu, type MatchEvent, type EventContextMenuCallbacks } from "@/components/admin/EventContextMenu";
import { DeleteEventModal } from "@/components/admin/DeleteEventModal";
import { EditMinuteModal } from "@/components/admin/EditMinuteModal";
import { ChangePlayerModal } from "@/components/admin/ChangePlayerModal";
import { PenaltyShootoutModal } from "@/components/admin/PenaltyShootoutModal";
import { FinalizeMatchModal } from "@/components/admin/FinalizeMatchModal";
import { FastEventModal } from "@/components/admin/FastEventModal";
import { toggleMatchClock, createPlayer } from "@/app/admin/actions";
export function LiveControlRoom({ match, homePlayers, awayPlayers, onUpdate }: { match: any, homePlayers: any[], awayPlayers: any[], onUpdate?: () => void }) {
  const router = useRouter();
  
  // Timer State (Initialized from DB)
  const [isPlaying, setIsPlaying] = useState(match.clock_status === 'RUNNING');
  const [isTogglingClock, setIsTogglingClock] = useState(false);
  const [seconds, setSeconds] = useState(() => {
    let base = match.clock_elapsed_seconds || 0;
    if (match.clock_status === 'RUNNING' && match.clock_last_started_at) {
      const start = new Date(match.clock_last_started_at).getTime();
      const now = new Date().getTime();
      base += Math.floor((now - start) / 1000);
    }
    return base;
  });
  
  // Event State
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeRosterTab, setActiveRosterTab] = useState<'home' | 'away'>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sub State
  const [isSubMode, setIsSubMode] = useState(false);
  const [playerOut, setPlayerOut] = useState<any>(null);

  // Search / AdHoc State
  const [searchHome, setSearchHome] = useState("");
  const [searchAway, setSearchAway] = useState("");
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  // ── Fast Event Modal State ──
  const [fastEvent, setFastEvent] = useState<{isOpen: boolean, teamId: string, teamName: string, eventType: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD"} | null>(null);

  // ── Delete Event Modal State ──
  const [eventToDelete, setEventToDelete] = useState<MatchEvent | null>(null);

  // ── Edit Minute Modal State ──
  const [eventToEditMinute, setEventToEditMinute] = useState<MatchEvent | null>(null);

  // ── Change Player Modal State ──
  const [eventToChangePlayer, setEventToChangePlayer] = useState<MatchEvent | null>(null);

  // ── Penalty Shootout Modal State ──
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  // ── Finalize Match Modal State ──
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // ── Context Menu Callbacks ──
  const eventMenuCallbacks: EventContextMenuCallbacks = {
    onEditMinute: (ev: MatchEvent) => setEventToEditMinute(ev),
    onChangePlayer: (ev: MatchEvent) => setEventToChangePlayer(ev),
    onDelete: (ev: MatchEvent) => setEventToDelete(ev),
  };

  // Called by DeleteEventModal
  const handleDeleteConfirm = async (eventId: string, tournamentId: string) => {
    await deleteMatchEvent(eventId, tournamentId);
    if (onUpdate) onUpdate();
    router.refresh();
  };

  // Called by EditMinuteModal
  const handleEditMinuteConfirm = async (eventId: string, minute: number, matchId: string, tournamentId: string) => {
    await updateMatchEventFields(eventId, { minute }, matchId, tournamentId);
    if (onUpdate) onUpdate();
    router.refresh();
  };

  // Called by ChangePlayerModal
  const handleChangePlayerConfirm = async (eventId: string, playerId: string, matchId: string, tournamentId: string) => {
    await updateMatchEventFields(eventId, { player_id: playerId }, matchId, tournamentId);
    if (onUpdate) onUpdate();
    router.refresh();
  };

  // Sync state if match prop changes from server (e.g., after router.refresh)
  useEffect(() => {
    if (isTogglingClock) return; // Prevent flashing during optimistic update
    
    const serverRunning = match.clock_status === 'RUNNING';
    let base = match.clock_elapsed_seconds || 0;
    
    if (serverRunning && match.clock_last_started_at) {
      const start = new Date(match.clock_last_started_at).getTime();
      const now = new Date().getTime();
      base += Math.floor((now - start) / 1000);
    }
    
    setSeconds(base);
    setIsPlaying(serverRunning);
  }, [match.clock_status, match.clock_elapsed_seconds, match.clock_last_started_at, isTogglingClock]);

  // Timer logic - Absolute time based
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (match.clock_last_started_at && match.clock_status === 'RUNNING' && !isTogglingClock) {
           const start = new Date(match.clock_last_started_at).getTime();
           const now = new Date().getTime();
           setSeconds(Math.floor((now - start) / 1000) + (match.clock_elapsed_seconds || 0));
        } else {
           // Fallback for optimistic UI (ticks normally until server revalidates)
           setSeconds((s: number) => s + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, match.clock_last_started_at, match.clock_elapsed_seconds, match.clock_status, isTogglingClock]);

  const handleToggleClock = async (start: boolean) => {
    if (isTogglingClock) return;
    setIsTogglingClock(true);
    
    // Optimistic update
    setIsPlaying(start);

    try {
      await toggleMatchClock(match.id, start, seconds, match.tournament_id);
      // Wait a bit for DB to settle before refreshing to avoid race conditions in UI
      setTimeout(() => {
        if (onUpdate) onUpdate();
        router.refresh();
        setIsTogglingClock(false);
      }, 500);
    } catch(e) {
      console.error(e);
      setIsPlaying(!start); // Revert
      setIsTogglingClock(false);
    }
  };
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  
  const currentMinute = Math.floor(seconds / 60) + 1;

  const handleFinalizeMatch = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await updateMatchScore(
        match.id,
        match.home_score || 0,
        match.away_score || 0,
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

  const handleEvent = async (type: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD") => {
    if (!selectedPlayer) return;
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      await createMatchEvent({
        match_id: match.id,
        tournament_id: match.tournament_id,
        team_id: selectedTeamId!,
        player_id: selectedPlayer.id,
        type,
        minute: currentMinute,
        description: null
      });
      setSelectedPlayer(null);
      setSelectedTeamId(null);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFastEventSubmit = async (playerName: string | null) => {
    if (!fastEvent) return;
    let playerId = null;
    
    // 1. If player name is provided, create the player on the fly
    if (playerName) {
       const res = await createPlayer({
         team_id: fastEvent.teamId,
         name: playerName,
       });
       playerId = res.player.id;
    }

    // 2. Register the event
    await createMatchEvent({
       match_id: match.id,
       tournament_id: match.tournament_id,
       team_id: fastEvent.teamId,
       player_id: playerId,
       type: fastEvent.eventType,
       minute: currentMinute,
       description: null
     });

     if (onUpdate) onUpdate();
     router.refresh();
  };

  const handleSubstitution = async (playerIn: any) => {
    if (!playerOut || !isSubMode) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createMatchEvent({
        match_id: match.id,
        tournament_id: match.tournament_id,
        team_id: playerOut.team_id,
        player_id: playerIn.id,
        type: "SUBSTITUTION",
        minute: currentMinute,
        description: `Sale: ${playerOut.name} (#${playerOut.number || '?'})`
      });
      setIsSubMode(false);
      setPlayerOut(null);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar cambio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayerClick = (player: any, teamId: string) => {
    if (isSubMode) {
      if (!playerOut) {
        setPlayerOut(player);
      } else {
        if (player.team_id !== playerOut.team_id) {
          setErrorMsg("El cambio debe ser del mismo equipo");
          return;
        }
        handleSubstitution(player);
      }
    } else {
      setSelectedPlayer(player);
      setSelectedTeamId(teamId);
      setErrorMsg("");
    }
  };

  const handleAdHocPlayer = async (teamId: string, name: string) => {
    if (!name.trim()) return;
    setIsCreatingPlayer(true);
    setErrorMsg("");
    try {
      const res = await createPlayer({
        team_id: teamId,
        name: name.trim(),
      });
      if (res.success && res.player) {
        setSelectedPlayer(res.player);
        setSelectedTeamId(teamId);
        if (teamId === match.home_team_id) setSearchHome("");
        else setSearchAway("");
        if (onUpdate) onUpdate();
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear jugador ad-hoc");
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const renderRoster = (
    players: any[],
    teamId: string,
    align: 'left' | 'right',
    teamColor: string,
    displayClass = 'flex'
  ) => {
    const isHome = teamId === match.home_team_id;
    const searchVal = isHome ? searchHome : searchAway;
    const setSearch = isHome ? setSearchHome : setSearchAway;
    
    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()));
    
    // Si no hay coincidencias exactas, podemos sugerir crearlo
    const exactMatch = players.some(p => p.name.toLowerCase() === searchVal.toLowerCase().trim());
    const canCreate = searchVal.trim().length > 2 && !exactMatch;

    return (
      <div className={`${displayClass} flex-1 min-h-[320px] lg:min-h-0 bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-2xl flex-col overflow-hidden shadow-[0_0_30px_rgba(0,100,255,0.05)]`}>
        <div 
          className="h-1.5 w-full" 
          style={{ backgroundColor: teamColor || (align === 'left' ? '#0066cc' : '#ff0055') }} 
        />
        
        {/* Búsqueda / Ad-Hoc */}
        <div className="p-3 border-b border-[#0055cc]/20">
          <input 
            type="text" 
            placeholder="Buscar o añadir jugador..."
            value={searchVal}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canCreate && !isCreatingPlayer) {
                e.preventDefault();
                handleAdHocPlayer(teamId, searchVal);
              }
            }}
            className="w-full bg-[#001122]/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
          />
          {canCreate && (
            <button
              disabled={isCreatingPlayer}
              onClick={() => handleAdHocPlayer(teamId, searchVal)}
              className="mt-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {isCreatingPlayer ? <Activity className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
              Crear y Seleccionar
            </button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2">
            {filteredPlayers.map(p => {
              const isSelected = selectedPlayer?.id === p.id;
              const isOut = playerOut?.id === p.id;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => handlePlayerClick(p, teamId)}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-[#00f0ff]/20 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)]' 
                      : isOut 
                        ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)]'
                        : 'bg-[#001122]/40 border-white/5 hover:border-[#0055cc]/50 hover:bg-[#002244]/60'
                  } ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
                >
                  {/* Numero Prominente */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
                    isSelected ? 'bg-[#00f0ff] text-black' : 
                    isOut ? 'bg-red-500 text-black' : 
                    'bg-[#02060d] border border-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]'
                  }`}>
                    <span className="text-lg font-black font-mono leading-none tracking-tighter">
                      {p.number || '-'}
                    </span>
                  </div>
                  
                  <div className={`flex flex-col flex-1 min-w-0 justify-center ${align === 'right' ? 'mr-3' : 'ml-3'}`}>
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider leading-tight ${
                      isSelected || isOut ? 'text-white' : 'text-white/90'
                    }`}>
                      {p.name}
                    </span>
                    {p.photo_url && (
                      <span className="text-[8px] text-[#00f0ff]/50 font-mono flex items-center gap-1 mt-1">
                        <div className="w-2.5 h-2.5 rounded-full overflow-hidden inline-block relative opacity-80">
                           <Image src={p.photo_url} alt="foto" fill className="object-cover" unoptimized />
                        </div>
                        FOTO
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRosterTabs = () => {
    const tabs = [
      {
        id: 'home' as const,
        label: match.home_team?.name || 'Local',
        color: match.home_team?.primary_color || '#0066cc',
      },
      {
        id: 'away' as const,
        label: match.away_team?.name || 'Visitante',
        color: match.away_team?.primary_color || '#ff0055',
      },
    ];

    return (
      <div className="lg:hidden bg-[#02060d]/90 backdrop-blur-md border border-[#0055cc]/30 rounded-2xl p-1.5 grid grid-cols-2 gap-1 shadow-[0_0_24px_rgba(0,100,255,0.08)]">
        {tabs.map((tab) => {
          const isActive = activeRosterTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveRosterTab(tab.id);
                setSelectedPlayer(null);
                setSelectedTeamId(null);
                setErrorMsg("");
              }}
              className={`relative min-h-12 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all overflow-hidden ${
                isActive
                  ? 'text-white bg-[#001f3f] border border-[#00f0ff]/50 shadow-[0_0_18px_rgba(0,240,255,0.16)]'
                  : 'text-white/45 border border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <span
                className={`absolute inset-x-4 top-0 h-0.5 rounded-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundColor: tab.color }}
              />
              <span className="block truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#040c1a] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0066cc]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ff0055]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#0055cc]/30 bg-[#02060d]/90 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
          <Link href={`/admin/tournaments/${match.tournament_id}`} className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
            <Shield size={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Volver al Torneo</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-[0.3em] rounded flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> EN VIVO
          </span>
          <span className="text-[10px] text-[#00f0ff]/50 font-mono tracking-widest">{match.stage}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 flex flex-col relative z-10 max-w-[1600px] mx-auto w-full gap-6">
        
        {/* SCOREBOARD PANEL */}
        <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
          
          {/* Cronómetro */}
          <div className="mb-6 flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-4">
              {formatTime(seconds)}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleToggleClock(!isPlaying)}
                disabled={isTogglingClock}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'bg-[#00f0ff] text-black border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                    : 'bg-[#0055cc]/20 border-[#0055cc] hover:bg-[#00f0ff] hover:text-black hover:border-[#00f0ff] text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                } ${isTogglingClock ? 'opacity-50 cursor-wait' : ''}`}
                title={isPlaying ? "Pausar" : "Iniciar"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
              <button 
                onClick={() => { setIsPlaying(false); setSeconds(0); }}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-white/50 hover:text-white"
                title="Reiniciar cronómetro"
              >
                <Square size={14} />
              </button>
              
              <button 
                onClick={() => setShowFinalizeModal(true)}
                disabled={isSubmitting}
                className="ml-4 h-12 px-6 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500 hover:text-black text-red-400 font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] disabled:opacity-50"
                title="Terminar partido oficialmente"
              >
                <CheckCircle size={16} /> Finalizar Partido
              </button>

              {match.is_knockout && (
                <button
                  onClick={() => setShowPenaltyModal(true)}
                  className="ml-2 h-12 px-6 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff] hover:text-black text-[#00f0ff] font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                  title="Registrar tanda de penales"
                >
                  Tanda de Penales
                </button>
              )}
            </div>
          </div>

          {/* Marcador Central */}
          <div className="flex items-center w-full justify-between max-w-4xl mx-auto gap-2 sm:gap-4 md:gap-8 px-2 sm:px-0">
            {/* Local */}
            <div className="flex-1 flex flex-col items-center gap-2 md:gap-4 text-center min-w-[30%]">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#001122] rounded-2xl border border-[#0055cc]/30 p-2 sm:p-4 shadow-inner flex items-center justify-center overflow-hidden mb-2">
                {match.home_team?.logo_url ? (
                  <Image src={match.home_team.logo_url} alt="Local" width={90} height={90} className="object-contain w-full h-full" unoptimized />
                ) : <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-[#0055cc]/40" />}
              </div>
              <h2 className="text-sm sm:text-xl md:text-3xl font-black uppercase tracking-tighter line-clamp-2 leading-tight mb-2">
                {match.home_team?.name || 'Local'}
              </h2>
              <button 
                onClick={() => setFastEvent({ isOpen: true, teamId: match.home_team_id, teamName: match.home_team?.name || 'Local', eventType: 'GOAL' })}
                disabled={isSubmitting || !isPlaying}
                className="w-full max-w-[140px] h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black text-emerald-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-1 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Goal size={14} /> + GOL
              </button>
            </div>
            
            {/* Puntos y Penales */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-10 shrink-0">
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-5xl sm:text-6xl md:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] tabular-nums">
                    {match.home_score || 0}
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl md:text-6xl font-black text-[#00f0ff]/30">-</span>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-5xl sm:text-6xl md:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] tabular-nums">
                    {match.away_score || 0}
                  </span>
                </div>
              </div>
              
              {/* Penales (si hay) */}
              {(match.home_penalty_score !== null || match.away_penalty_score !== null) && (
                <div className="flex items-center justify-center gap-8 mt-2">
                  <span className="text-lg sm:text-2xl md:text-4xl font-bold text-[#00f0ff] opacity-80">
                    ({match.home_penalty_score ?? 0})
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#00f0ff]/50 font-bold">Penales</span>
                  <span className="text-lg sm:text-2xl md:text-4xl font-bold text-[#00f0ff] opacity-80">
                    ({match.away_penalty_score ?? 0})
                  </span>
                </div>
              )}
            </div>

            {/* Visitante */}
            <div className="flex-1 flex flex-col items-center gap-2 md:gap-4 text-center min-w-[30%]">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#001122] rounded-2xl border border-[#0055cc]/30 p-2 sm:p-4 shadow-inner flex items-center justify-center overflow-hidden mb-2">
                {match.away_team?.logo_url ? (
                  <Image src={match.away_team.logo_url} alt="Visitante" width={90} height={90} className="object-contain w-full h-full" unoptimized />
                ) : <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-[#0055cc]/40" />}
              </div>
              <h2 className="text-sm sm:text-xl md:text-3xl font-black uppercase tracking-tighter line-clamp-2 leading-tight mb-2">
                {match.away_team?.name || 'Visitante'}
              </h2>
              <button 
                onClick={() => setFastEvent({ isOpen: true, teamId: match.away_team_id, teamName: match.away_team?.name || 'Visitante', eventType: 'GOAL' })}
                disabled={isSubmitting || !isPlaying}
                className="w-full max-w-[140px] h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black text-emerald-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-1 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Goal size={14} /> + GOL
              </button>
            </div>
          </div>
        </div>

        {/* CONTROLES INFERIORES */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-0 pb-10 lg:pb-0">
          
          {/* Panel de Eventos (Top on mobile, Middle on desktop) */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 order-1 lg:order-2">
            
            {/* Controles Dinámicos */}
            <div className="bg-[#02060d]/90 backdrop-blur-md border border-[#00f0ff]/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
              {!isSubMode ? (
                <>
                  <button
                    onClick={() => {
                      setIsSubMode(true);
                      setSelectedPlayer(null);
                      setPlayerOut(null);
                    }}
                    className="w-full bg-[#001122] border border-[#0055cc]/50 text-white py-3 rounded-xl mb-6 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#002244] transition-colors"
                  >
                    <Activity size={14} className="text-[#00f0ff]" /> MODO: CAMBIOS (SUBSTITUCIÓN)
                  </button>

                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/60 font-black text-center mb-4">
                    Panel de Eventos Rápidos
                  </h3>
                  
                  {selectedPlayer ? (
                    <div className="flex flex-col gap-4">
                      <div className="bg-[#001133]/50 p-4 rounded-xl text-center border border-[#00f0ff]/30">
                        <span className="text-[10px] text-white/50 block mb-1">JUGADOR SELECCIONADO</span>
                        <span className="text-sm font-bold text-white uppercase">{selectedPlayer.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleEvent('GOAL')}
                          disabled={isSubmitting}
                          className="bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500 text-emerald-400 hover:text-black py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                        >
                          <Goal size={24} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Anotar Gol</span>
                        </button>
                        <button 
                          onClick={() => handleEvent('OWN_GOAL')}
                          disabled={isSubmitting}
                          className="bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500 text-orange-400 hover:text-black py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                        >
                          <Goal size={24} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Autogol</span>
                        </button>

                        <button 
                          onClick={() => handleEvent('YELLOW_CARD')}
                          disabled={isSubmitting}
                          className="bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500 text-yellow-400 hover:text-black py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                        >
                          <div className="w-4 h-6 bg-yellow-400 group-hover:bg-black rounded-sm shadow-sm" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Amarilla</span>
                        </button>

                        <button 
                          onClick={() => handleEvent('RED_CARD')}
                          disabled={isSubmitting}
                          className="bg-red-500/20 border border-red-500/50 hover:bg-red-500 text-red-400 hover:text-black py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
                        >
                          <div className="w-4 h-6 bg-red-500 group-hover:bg-black rounded-sm shadow-sm" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Roja</span>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedPlayer(null)}
                        className="text-[9px] text-white/30 uppercase tracking-widest hover:text-white mt-2 text-center"
                      >
                        Cancelar Selección
                      </button>
                    </div>
                  ) : (
                    <div className="py-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-[#00f0ff]/20 rounded-xl bg-[#001122]/30">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed px-4">
                        Selecciona un jugador del roster local o visitante para registrar un evento.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00f0ff]/50">Modo Cambio</span>
                     <button onClick={() => { setIsSubMode(false); setPlayerOut(null); }} className="text-white/40 hover:text-white text-[10px] uppercase">Cancelar</button>
                  </div>
                  
                  <div className="bg-[#001133]/50 p-4 rounded-xl border border-dashed border-red-500/30 flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="text-[9px] text-red-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1"><UserMinus size={12}/> SALE</span>
                       <span className="text-sm text-white font-bold">{playerOut ? playerOut.name : 'Seleccione jugador...'}</span>
                     </div>
                  </div>

                  <div className="bg-[#001133]/50 p-4 rounded-xl border border-dashed border-emerald-500/30 flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1"><UserPlus size={12}/> ENTRA</span>
                       <span className="text-sm text-white/50">{playerOut ? 'Seleccione reemplazo...' : 'Esperando...'}</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="flex-1 bg-[#02060d]/80 backdrop-blur-md border border-[#0055cc]/30 rounded-2xl flex flex-col overflow-hidden">
               <div className="p-4 border-b border-[#0055cc]/20 bg-[#001122]/50 flex items-center gap-2">
                 <Clock size={14} className="text-[#00f0ff]" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Timeline</span>
               </div>
               <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                 {match.match_events?.map((ev: any) => {
                   let icon = <Goal size={14} className="text-emerald-400" />;
                   let evName = "GOL";
                   if (ev.type === 'YELLOW_CARD') { icon = <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"/>; evName = "AMARILLA"; }
                   if (ev.type === 'RED_CARD') { icon = <div className="w-2.5 h-3.5 bg-red-500 rounded-sm"/>; evName = "ROJA"; }
                   if (ev.type === 'OWN_GOAL') { icon = <Goal size={14} className="text-orange-400" />; evName = "AUTOGOL"; }
                   if (ev.type === 'SUBSTITUTION') { icon = <Activity size={14} className="text-[#00f0ff]" />; evName = "CAMBIO"; }
                   
                   const isHome = ev.team_id === match.home_team_id;

                   return (
                     <div
                       key={ev.id}
                       className={`group relative flex items-start gap-3 p-3 rounded-lg bg-[#001122]/30 border border-[#0055cc]/10 hover:border-[#0055cc]/25 hover:bg-[#001122]/50 transition-all duration-150 ${isHome ? '' : 'flex-row-reverse text-right'}`}
                     >
                       <div className="pt-1 shrink-0">{icon}</div>

                       <div className="flex flex-col flex-1 min-w-0">
                         <div className={`flex items-center gap-2 ${isHome ? '' : 'flex-row-reverse'}`}>
                           <span className="text-xs font-bold text-white uppercase truncate">{ev.player?.name}</span>
                           <span className="text-[9px] font-mono text-[#00f0ff]/50 shrink-0">{ev.minute ? `${ev.minute}'` : ''}</span>
                         </div>
                         <span className="text-[9px] text-white/40 uppercase tracking-widest">{evName} {ev.description ? `(${ev.description})` : ''}</span>
                       </div>

                       {/* Context menu – visible on hover (desktop) and always on mobile */}
                       <div className={`shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 ${isHome ? 'order-last' : 'order-first'}`}>
                         <EventContextMenu
                           event={ev as MatchEvent}
                           callbacks={eventMenuCallbacks}
                           alignRight={!isHome}
                         />
                       </div>
                     </div>
                   );
                 })}
                 
                 {(!match.match_events || match.match_events.length === 0) && (
                   <span className="text-[10px] text-white/20 uppercase tracking-widest text-center mt-10">Sin eventos registrados</span>
                 )}
               </div>
            </div>
            
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-xs text-red-400">
                <AlertTriangle size={14} /> {errorMsg}
              </div>
            )}
          </div>
          {/* Rosters (Side-by-side en móvil, independientes en desktop gracias a lg:contents) */}
          <div className="flex flex-row gap-2 w-full order-2 lg:contents">
            {/* Roster Local */}
            {renderRoster(homePlayers, match.home_team_id, 'left', match.home_team?.primary_color, 'flex-1 flex order-1')}

            {/* Roster Visitante */}
            {renderRoster(awayPlayers, match.away_team_id, 'right', match.away_team?.primary_color, 'flex-1 flex order-3')}
          </div>

        </div>
      </div>

      {/* ── Delete Event Modal ── */}
      <DeleteEventModal
        event={eventToDelete}
        tournamentId={match.tournament_id}
        onConfirm={handleDeleteConfirm}
        onClose={() => setEventToDelete(null)}
      />

      {/* ── Edit Minute Modal ── */}
      <EditMinuteModal
        event={eventToEditMinute}
        matchId={match.id}
        tournamentId={match.tournament_id}
        onConfirm={handleEditMinuteConfirm}
        onClose={() => setEventToEditMinute(null)}
      />

      {/* ── Change Player Modal ── */}
      <ChangePlayerModal
        event={eventToChangePlayer}
        matchId={match.id}
        tournamentId={match.tournament_id}
        allPlayers={[...homePlayers, ...awayPlayers]}
        onConfirm={handleChangePlayerConfirm}
        onClose={() => setEventToChangePlayer(null)}
      />
      {/* Penalty Shootout Modal */}
      {showPenaltyModal && (
        <PenaltyShootoutModal
          matchId={match.id}
          tournamentId={match.tournament_id}
          homeTeamName={match.home_team?.name || 'Local'}
          awayTeamName={match.away_team?.name || 'Visitante'}
          currentHomeScore={match.home_score || 0}
          currentAwayScore={match.away_score || 0}
          currentHomePenalties={match.home_penalty_score}
          currentAwayPenalties={match.away_penalty_score}
          currentVersion={match.version || 1}
          onClose={() => setShowPenaltyModal(false)}
        />
      )}

      {/* Finalize Match Modal */}
      {showFinalizeModal && (
        <FinalizeMatchModal
          isKnockout={!!match.is_knockout}
          isTied={(match.home_score || 0) === (match.away_score || 0)}
          homeTeamName={match.home_team?.name || 'Local'}
          awayTeamName={match.away_team?.name || 'Visitante'}
          homeScore={match.home_score || 0}
          awayScore={match.away_score || 0}
          onConfirm={() => {
            setShowFinalizeModal(false);
            handleFinalizeMatch();
          }}
          onExtraTime={() => setShowFinalizeModal(false)}
          onPenalties={() => {
            setShowFinalizeModal(false);
            setShowPenaltyModal(true);
          }}
          onClose={() => setShowFinalizeModal(false)}
        />
      )}

      {/* ── Fast Event Modal ── */}
      <FastEventModal
        isOpen={!!fastEvent?.isOpen}
        onClose={() => setFastEvent(null)}
        onSubmit={handleFastEventSubmit}
        teamName={fastEvent?.teamName || ""}
        eventType={fastEvent?.eventType || "GOAL"}
      />

    </div>
  );
}
