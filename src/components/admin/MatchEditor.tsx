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

  return (
    <div className={`border border-brand-navy/30 rounded-xl overflow-hidden transition-all ${isFinished ? 'opacity-70' : ''}`}>
      {/* Main Row (Always Visible) */}
      <div 
        onClick={() => !isFinished && setIsOpen(!isOpen)}
        className={`group p-4 lg:p-6 flex items-center justify-between transition-all ${
          !isFinished ? 'bg-brand-deep hover:bg-[#001122] cursor-pointer' : 'bg-brand-navy/5 cursor-default'
        }`}
      >
        <div className="flex items-center gap-4 lg:gap-6">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isFinished ? 'bg-brand-navy' : 'bg-brand-cyan animate-pulse'}`} />
          <div className="flex flex-col">
            <span className="text-[8px] text-brand-aqua/50 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <span>{match.stage} • {isFinished ? 'FINALIZADO' : 'PENDIENTE'}</span>
              {match.match_date && (
                <>
                  <span className="text-brand-aqua/30">•</span>
                  <span className="text-brand-cyan">
                    {new Date(match.match_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })} {formatTimeAMPM(match.match_time)}
                  </span>
                </>
              )}
            </span>
            <div className="flex items-center gap-2 lg:gap-3 mt-1">
              <span className="font-black text-sm lg:text-xl text-brand-sand uppercase tracking-tighter group-hover:text-white transition-colors">
                {match.home_team?.name || 'TBD'} <span className="text-brand-aqua/20">vs</span> {match.away_team?.name || 'TBD'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="text-xl lg:text-3xl font-black text-brand-sand flex items-center gap-2 tabular-nums">
            <span>{match.home_score ?? "-"}</span>
            <span className="text-brand-aqua/20 text-lg lg:text-xl">:</span>
            <span>{match.away_score ?? "-"}</span>
          </div>
          <Link 
            href={`/admin/matches/${match.id}`}
            className="flex bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-3 py-2 lg:px-4 lg:py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-brand-deep transition-all rounded z-10"
            onClick={(e) => e.stopPropagation()}
          >
            Control Room
          </Link>
          {!isFinished && (
            <div className="text-brand-aqua/30">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          )}
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

            <div className="w-full lg:w-auto flex gap-3">
              <Link 
                href={`/admin/matches/${match.id}`}
                className="lg:hidden flex-1 flex items-center justify-center bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-brand-deep transition-all rounded"
              >
                Control Room
              </Link>
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
