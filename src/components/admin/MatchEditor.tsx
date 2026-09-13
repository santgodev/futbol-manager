"use client";
import { useState, useEffect } from "react";
import { updateMatchSchedule, deleteMatch } from "@/app/admin/actions";
import { Calendar, CheckCircle2, Loader2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatVolleyballSets } from "@/utils/volleyball";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TIME_SLOTS = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30",
  "19:00","19:30","20:00","20:30","21:00","21:30","22:00"
];

function formatTimeAMPM(timeStr: string | null) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

// Parse "YYYY-MM-DD" → { day, month, year }
function parseDateStr(s: string) {
  if (!s) return { day: "", month: "", year: "" };
  const [y, m, d] = s.split("-");
  return { day: String(parseInt(d)), month: String(parseInt(m) - 1), year: y };
}
// Build "YYYY-MM-DD" from parts
function buildDateStr(day: string, month: string, year: string) {
  if (!day || month === "" || !year) return "";
  return `${year}-${String(parseInt(month) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function MatchEditor({ match, tournamentId, venues = [], isHighlighted = false, onUpdate }: { match: any, tournamentId: string, venues?: any[], isHighlighted?: boolean, onUpdate?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initDate = parseDateStr(match.match_date ?? "");
  const [selDay, setSelDay] = useState(initDate.day);
  const [selMonth, setSelMonth] = useState(initDate.month);
  const [selYear, setSelYear] = useState(initDate.year);
  const [selTime, setSelTime] = useState(match.match_time ? match.match_time.slice(0, 5) : "18:00");
  const [venueId, setVenueId] = useState(match.venue_id || "");
  const [customVenue, setCustomVenue] = useState(match.venue || "");

  const matchDate = buildDateStr(selDay, selMonth, selYear);
  const matchTime = selTime;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1].map(String);
  const daysInMonth = selMonth !== "" && selYear
    ? new Date(parseInt(selYear), parseInt(selMonth) + 1, 0).getDate()
    : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const activeVenues = venues.filter((venue) => venue.is_active !== false);

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
      await updateMatchSchedule(match.id, matchDate, matchTime, tournamentId, venueId || null, venueId ? null : customVenue);
      setStatus("success");
      if (onUpdate) onUpdate();
      else router.refresh();
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Error al guardar");
    }
  };

  const handleDeleteMatch = async () => {
    if (!confirm("¿Seguro que deseas eliminar este partido? Esta acción no se puede deshacer y puede afectar la tabla de posiciones si ya tenía resultados.")) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await deleteMatch(match.id, tournamentId);
      if (onUpdate) onUpdate();
      else router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Error al eliminar");
      setIsDeleting(false);
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
  const setLine = formatVolleyballSets(match.match_sets);

  return (
    <div id={`match-${match.id}`} className={`border shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden transition-all duration-1000 ${isHighlighted ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-[pulse_2s_ease-in-out_infinite]' : isFinished ? 'opacity-70 border-brand-navy/30' : 'border-brand-teal/30 hover:border-brand-teal/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]'}`}>
      {/* Main Row (Always Visible) */}
      <div 
        onClick={() => !isFinished && setIsOpen(!isOpen)}
        className={`group p-4 lg:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between transition-all ${
          !isFinished ? 'bg-[#050b14]/80 hover:bg-[#0a1526]/90 cursor-pointer' : 'bg-[#02060d]/60 cursor-default'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3 lg:gap-6 w-full sm:w-auto min-w-0">
          <div className={`w-2 h-2 mt-1.5 sm:mt-0 rounded-full shrink-0 ${currentStatus.dotClass}`} />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] text-brand-aqua/50 uppercase tracking-[0.2em] font-black bg-brand-navy/30 border border-brand-navy/55 px-2 py-0.5 rounded-full shrink-0">
                {match.stage}
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${currentStatus.colorClass}`}>
                {currentStatus.label}
              </span>
              {match.match_date ? (
                <span className="text-[8px] font-mono text-brand-teal bg-[#001122]/80 border border-brand-teal/20 px-2 py-0.5 rounded-full shrink-0">
                  {new Date(match.match_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })} {formatTimeAMPM(match.match_time)}
                </span>
              ) : (
                <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                  Sin Fecha
                </span>
              )}
              {match.venue && (
                <span className="text-[8px] font-mono text-[#00f0ff]/70 bg-[#00f0ff]/10 border border-[#00f0ff]/20 px-2 py-0.5 rounded-full shrink-0">
                  {match.venue}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-3 min-w-0">
              <span className="font-black text-sm sm:text-lg lg:text-xl text-brand-sand uppercase tracking-tight group-hover:text-white transition-colors truncate max-w-[40%] sm:max-w-none">
                {match.home_team?.name || 'TBD'}
              </span>
              <span className="text-[9px] font-black text-brand-teal/50 uppercase shrink-0">vs</span>
              <span className="font-black text-sm sm:text-lg lg:text-xl text-brand-sand uppercase tracking-tight group-hover:text-white transition-colors truncate max-w-[40%] sm:max-w-none">
                {match.away_team?.name || 'TBD'}
              </span>
            </div>
            {setLine && (
              <span className="text-[9px] font-mono text-[#00f0ff]/55 uppercase tracking-widest mt-2">
                Sets: {setLine}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-8 w-full sm:w-auto pl-5 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-0 border-brand-navy/30">
          <div className="text-xl lg:text-3xl font-black text-brand-sand flex items-center gap-2 tabular-nums">
            {match.home_penalty_score !== null && (
              <span className="text-xs lg:text-base text-brand-teal/70">({match.home_penalty_score})</span>
            )}
            <span className="min-w-[1ch] text-center">{match.home_score ?? "-"}</span>
            <span className="text-brand-teal/40 text-sm lg:text-xl">:</span>
            <span className="min-w-[1ch] text-center">{match.away_score ?? "-"}</span>
            {match.away_penalty_score !== null && (
              <span className="text-xs lg:text-base text-brand-teal/70">({match.away_penalty_score})</span>
            )}
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
        <div className="bg-[#001122]/60 border-t border-[#00f0ff]/20">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                <Calendar size={14} className="text-[#00f0ff]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff]">
                Programar Encuentro
              </span>
            </div>

            {/* Fecha — input nativo dentro de jaula overflow-hidden */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#00f0ff]/50 font-bold">Fecha del Partido</label>
              <div className="w-full overflow-hidden rounded-lg border border-[#00f0ff]/20 bg-[#000814]">
                <input 
                  type="date" 
                  value={matchDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => { 
                    const parts = e.target.value.split("-");
                    if (parts.length === 3) {
                      setSelYear(parts[0]); 
                      setSelMonth(String(parseInt(parts[1]) - 1)); 
                      setSelDay(parts[2]);
                    }
                    setStatus("idle"); setErrorMessage(""); 
                  }}
                  className="w-full bg-transparent px-3 py-2.5 text-white text-sm outline-none [color-scheme:dark] cursor-pointer"
                  style={{ minWidth: 0, fontSize: "16px" }}
                />
              </div>
            </div>

            {/* Hora — select con slots */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#00f0ff]/50 font-bold">Hora de Inicio</label>
              <select
                value={selTime}
                onChange={(e) => { setSelTime(e.target.value); setStatus("idle"); setErrorMessage(""); }}
                className="w-full bg-[#000814] border border-[#00f0ff]/20 focus:border-[#00f0ff]/60 px-3 py-2.5 text-white text-sm outline-none rounded-lg appearance-none cursor-pointer"
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{formatTimeAMPM(t)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#00f0ff]/50 font-bold">Cancha</label>
              {activeVenues.length > 0 ? (
                <select
                  value={venueId}
                  onChange={(e) => {
                    setVenueId(e.target.value);
                    if (e.target.value) setCustomVenue("");
                    setStatus("idle");
                    setErrorMessage("");
                  }}
                  className="w-full bg-[#000814] border border-[#00f0ff]/20 focus:border-[#00f0ff]/60 px-3 py-2.5 text-white text-sm outline-none rounded-lg appearance-none cursor-pointer"
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
                  onChange={(e) => {
                    setCustomVenue(e.target.value);
                    setStatus("idle");
                    setErrorMessage("");
                  }}
                  placeholder="Cancha / sede..."
                  className="w-full bg-[#000814] border border-[#00f0ff]/20 focus:border-[#00f0ff]/60 px-3 py-2.5 text-white text-sm outline-none rounded-lg"
                />
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={handleDeleteMatch} 
                disabled={isDeleting || status === 'saving'}
                className="w-11 h-11 shrink-0 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 font-black flex items-center justify-center rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                title="Eliminar partido"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
              
              <button 
                onClick={handleUpdate} 
                disabled={status === 'saving' || isDeleting || !matchDate || !matchTime}
                className="flex-1 h-11 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl active:scale-[0.98]"
              >
                {status === 'saving' ? (
                  <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                ) : status === 'success' ? (
                  <><CheckCircle2 size={14} /> ¡Listo!</>
                ) : (
                  'Confirmar Fecha y Hora'
                )}
              </button>
            </div>
            
            {errorMessage && (
              <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
                {errorMessage}
              </p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
