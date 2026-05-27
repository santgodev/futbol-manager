"use client";
import { useState, useEffect } from "react";
import { updateMatchSchedule } from "@/app/admin/actions";
import { Calendar, Clock, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatTimeAMPM(timeStr: string | null) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

export function MatchEditor({ match, tournamentId }: { match: any, tournamentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [matchDate, setMatchDate] = useState(match.match_date ?? "");
  const [matchTime, setMatchTime] = useState(match.match_time ? match.match_time.slice(0, 5) : "");
  
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setIsOpen(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleUpdate = async () => {
    if (!matchDate || !matchTime) {
      setErrorMessage("Fecha y hora son requeridas.");
      setStatus("error");
      return;
    }
    
    setStatus("saving");
    try {
      await updateMatchSchedule(match.id, matchDate, matchTime, tournamentId);
      setStatus("success");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Error al guardar");
    }
  };

  const isFinished = match.status === 'FINISHED';

  const getMatchStatus = () => {
    if (match.status === 'FINISHED') {
      return {
        label: 'FINALIZADO',
        colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
      };
    }
    const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS' || match.clock_status === 'RUNNING' || ((match.home_score !== null || match.away_score !== null));
    if (isLive) {
      return {
        label: 'EN VIVO',
        colorClass: 'bg-rose-500/25 text-rose-400 border-rose-500/40 animate-pulse',
        dotClass: 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)]'
      };
    }
    if (match.match_date && match.match_time) {
      return {
        label: 'PROGRAMADO',
        colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
      };
    }
    return {
      label: 'POR AGENDAR',
      colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      dotClass: 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]'
    };
  };

  const currentStatus = getMatchStatus();

  return (
    <div className={`border border-brand-teal/30 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden transition-all ${isFinished ? 'opacity-70 border-brand-navy/30' : 'hover:border-brand-teal/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]'}`}>
      {/* Main Row (Always Visible) */}
      <div 
        onClick={() => !isFinished && setIsOpen(!isOpen)}
        className={`group p-4 lg:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between transition-all ${
          !isFinished ? 'bg-[#050b14]/80 hover:bg-[#0a1526]/90 cursor-pointer' : 'bg-[#02060d]/60 cursor-default'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3 lg:gap-6 w-full sm:w-auto">
          <div className={`w-2 h-2 mt-1.5 sm:mt-0 rounded-full shrink-0 ${currentStatus.dotClass}`} />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] text-brand-aqua/50 uppercase tracking-[0.2em] font-black bg-brand-navy/30 border border-brand-navy/55 px-2 py-0.5 rounded-full">
                {match.stage}
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${currentStatus.colorClass}`}>
                {currentStatus.label}
              </span>
              {match.match_date && (
                <span className="text-[8px] font-mono text-brand-teal bg-[#001122]/80 border border-brand-teal/20 px-2 py-0.5 rounded-full">
                  {new Date(match.match_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })} {formatTimeAMPM(match.match_time)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-3">
              <span className="font-black text-sm sm:text-lg lg:text-xl text-brand-sand uppercase tracking-tight group-hover:text-white transition-colors truncate">
                {match.home_team?.name || 'TBD'}
              </span>
              <span className="text-[9px] font-black text-brand-teal/50 uppercase">vs</span>
              <span className="font-black text-sm sm:text-lg lg:text-xl text-brand-sand uppercase tracking-tight group-hover:text-white transition-colors truncate">
                {match.away_team?.name || 'TBD'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-8 w-full sm:w-auto pl-5 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-0 border-brand-navy/30">
          <div className="text-xl lg:text-3xl font-black text-brand-sand flex items-center gap-2 tabular-nums">
            <span className="min-w-[1ch] text-center">{match.home_score ?? "-"}</span>
            <span className="text-brand-teal/40 text-sm lg:text-xl">:</span>
            <span className="min-w-[1ch] text-center">{match.away_score ?? "-"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/admin/match-room?id=${match.id}`}
              className="flex items-center justify-center bg-brand-teal/10 border border-brand-teal/30 text-brand-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-teal hover:text-brand-deep hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all rounded-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              Control Room
            </Link>
            {!isFinished && (
              <div className="text-brand-teal/50 p-1">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Scheduler */}
      {isOpen && !isFinished && (
        <div className="bg-[#001122]/80 border-t border-brand-cyan/20 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-brand-cyan" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan">
              Agendar Partido
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-end gap-4">
            <div className="flex-1 w-full flex gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-[0.15em] text-brand-aqua/60 font-bold">Fecha</label>
                <input 
                  type="date" 
                  value={matchDate} 
                  onChange={(e) => { setMatchDate(e.target.value); setStatus("idle"); setErrorMessage(""); }}
                  className="w-full bg-brand-deep border border-brand-navy focus:border-brand-cyan px-3 py-2 text-brand-sand font-mono text-xs outline-none transition-all rounded [color-scheme:dark]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-[0.15em] text-brand-aqua/60 font-bold">Hora</label>
                <input 
                  type="time" 
                  value={matchTime} 
                  onChange={(e) => { setMatchTime(e.target.value); setStatus("idle"); setErrorMessage(""); }}
                  className="w-full bg-brand-deep border border-brand-navy focus:border-brand-cyan px-3 py-2 text-brand-sand font-mono text-xs outline-none transition-all rounded [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="w-full lg:w-auto flex">
              <button 
                onClick={handleUpdate} 
                disabled={status === 'saving' || !matchDate || !matchTime}
                className="flex-1 lg:flex-none bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cyan/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded h-9"
              >
                {status === 'saving' ? (
                  <><Loader2 size={12} className="animate-spin" /> Guardando...</>
                ) : status === 'success' ? (
                  <><CheckCircle2 size={12} /> Agendado</>
                ) : (
                  'Guardar Fecha'
                )}
              </button>
            </div>
          </div>
          
          {errorMessage && (
            <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
