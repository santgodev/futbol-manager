"use client";

import { useState } from "react";
import { scheduleRound } from "@/app/admin/actions";
import { CalendarCheck, Loader2, CheckCircle2, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoundInfo {
  round_number: number;
  match_date: string | null;
  match_time: string | null;
  count: number;
}

interface RoundSchedulerProps {
  tournamentId: string;
  rounds: RoundInfo[];
}

const inputClass =
  "bg-[#040c1a]/80 border border-[#0055cc]/40 focus:border-[#00f0ff] px-3 py-2 text-white text-xs rounded-lg outline-none transition-all [color-scheme:dark] w-full";

function RoundRow({ round, tournamentId }: { round: RoundInfo; tournamentId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(round.match_date || "");
  const [time, setTime] = useState(round.match_time ? round.match_time.slice(0, 5) : "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const hasDate = !!round.match_date;

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    setError("");
    try {
      await scheduleRound(tournamentId, round.round_number, date, time);
      setSaved(true);
      setIsEditing(false);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al agendar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#0055cc]/20 rounded-lg overflow-hidden">
      {/* Compact Row - always visible */}
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#001122]/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded bg-[#0055cc]/20 text-[#00f0ff] text-[10px] font-black flex items-center justify-center shrink-0">
            {round.round_number}
          </span>
          <div>
            <p className="text-xs font-bold text-white">Jornada {round.round_number}</p>
            <p className="text-[10px] text-white/40">
              {round.count} partido{round.count !== 1 ? "s" : ""}
              {hasDate
                ? ` · ${new Date(round.match_date! + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })} ${round.match_time ? round.match_time.slice(0, 5) : ""}`
                : " · Sin fecha"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && <CheckCircle2 size={12} className="text-emerald-400" />}
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            hasDate
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            {hasDate ? "Agendada" : "Pendiente"}
          </span>
          <Pencil size={11} className="text-white/30" />
          {isEditing ? <ChevronUp size={13} className="text-white/40" /> : <ChevronDown size={13} className="text-white/40" />}
        </div>
      </button>

      {/* Expandable editor */}
      {isEditing && (
        <div className="px-4 pb-4 pt-2 bg-[#001122]/60 border-t border-[#0055cc]/20 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-[0.15em] text-[#00f0ff]/60 font-bold">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-[0.15em] text-[#00f0ff]/60 font-bold">Hora</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 h-8 rounded-lg border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !date || !time}
              className="flex-1 h-8 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#00f0ff]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={11} className="animate-spin" /> : <CalendarCheck size={11} />}
              {loading ? "Aplicando..." : "Aplicar a jornada"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RoundScheduler({ tournamentId, rounds }: RoundSchedulerProps) {
  // Collapsed by default to keep the page clean
  const [isOpen, setIsOpen] = useState(false);

  if (rounds.length === 0) return null;

  const scheduled = rounds.filter(r => r.match_date).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle header - compact */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2">
          <CalendarCheck size={13} className="text-[#00f0ff]" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Agendar por Jornada
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            scheduled === rounds.length
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-[#0055cc]/20 text-[#00f0ff] border-[#0055cc]/30"
          }`}>
            {scheduled}/{rounds.length} agendadas
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/40 group-hover:text-white/60 transition-colors">
          <span className="text-[9px] uppercase tracking-widest">
            {isOpen ? "Ocultar" : "Mostrar"}
          </span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {/* Expandable rounds list */}
      {isOpen && (
        <div className="flex flex-col gap-2">
          {rounds.map(round => (
            <RoundRow key={round.round_number} round={round} tournamentId={tournamentId} />
          ))}
        </div>
      )}
    </div>
  );
}
