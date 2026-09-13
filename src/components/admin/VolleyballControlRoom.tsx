"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Activity, AlertTriangle, CheckCircle, ChevronLeft, Minus, Plus, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateMatchScore, updateVolleyballSetScore } from "@/app/admin/actions";
import { getVolleyballSetTarget, summarizeVolleyballMatch } from "@/utils/volleyball";

export function VolleyballControlRoom({ match, onUpdate }: { match: any; onUpdate?: () => void }) {
  const router = useRouter();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const summary = useMemo(() => summarizeVolleyballMatch(match), [match]);
  const activeSetNumber = summary.currentSetNumber || 1;
  const sets = Array.from({ length: summary.bestOfSets }, (_, index) => {
    const setNumber = index + 1;
    const existing = summary.sets.find((set) => set.set_number === setNumber);
    return existing ?? {
      set_number: setNumber,
      home_points: 0,
      away_points: 0,
      status: setNumber === activeSetNumber ? "IN_PROGRESS" : "PENDING",
      winner_team_id: null,
      targetPoints: getVolleyballSetTarget(setNumber, summary.bestOfSets, summary.setPoints, summary.tiebreakPoints),
      isComplete: false,
      winnerSide: null,
    };
  });

  const saveSet = async (setNumber: number, homePoints: number, awayPoints: number, key: string) => {
    if (summary.isComplete) return;
    setSavingKey(key);
    setErrorMsg("");
    try {
      await updateVolleyballSetScore({
        matchId: match.id,
        tournamentId: match.tournament_id,
        setNumber,
        homePoints,
        awayPoints,
      });
      if (onUpdate) await onUpdate();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo guardar el punto.");
    } finally {
      setSavingKey(null);
    }
  };

  const finishMatch = async () => {
    setSavingKey("finish");
    setErrorMsg("");
    try {
      await updateMatchScore(
        match.id,
        summary.homeSetsWon,
        summary.awaySetsWon,
        match.tournament_id,
        match.version || 1,
        null,
        null,
        "FINISHED"
      );
      router.push(`/admin/tournaments/${match.tournament_id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo finalizar el partido.");
    } finally {
      setSavingKey(null);
    }
  };

  const renderTeam = (side: "home" | "away") => {
    const team = side === "home" ? match.home_team : match.away_team;
    const setsWon = side === "home" ? summary.homeSetsWon : summary.awaySetsWon;
    const pointsTotal = side === "home" ? summary.homePointsTotal : summary.awayPointsTotal;
    const isWinner = summary.winnerTeamId && summary.winnerTeamId === (side === "home" ? match.home_team_id : match.away_team_id);

    return (
      <div className={`flex flex-col items-center gap-3 text-center ${isWinner ? "opacity-100" : summary.isComplete ? "opacity-60" : ""}`}>
        <div className="w-20 h-20 rounded-2xl border border-[#00f0ff]/20 bg-[#001122] flex items-center justify-center overflow-hidden p-3">
          {team?.logo_url ? (
            <Image src={team.logo_url} alt={team.name || "Equipo"} width={72} height={72} className="object-contain" unoptimized />
          ) : (
            <Shield className="w-10 h-10 text-[#00f0ff]/30" />
          )}
        </div>
        <div>
          <h2 className="text-sm sm:text-xl font-black uppercase tracking-wider text-white leading-tight">{team?.name || "TBD"}</h2>
          <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1">{pointsTotal} puntos jugados</p>
        </div>
        <div className="text-6xl sm:text-8xl font-black text-white tabular-nums leading-none">{setsWon}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#040c1a] text-white flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b border-[#0055cc]/30 bg-[#02060d]/90 flex items-center justify-between gap-4">
        <Link href={`/admin/tournaments/${match.tournament_id}`} className="flex items-center gap-2 text-white/55 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em]">
          <ChevronLeft size={16} />
          Volver al torneo
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-[#00f0ff]">
          <Activity size={12} />
          Control voleibol
        </span>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col gap-6">
        <section className="rounded-2xl border border-[#00f0ff]/15 bg-[#02060d]/80 p-5 sm:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            {renderTeam("home")}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] text-[#00f0ff]/60 font-black uppercase tracking-[0.2em]">Sets</span>
              <span className="text-3xl sm:text-5xl text-[#00f0ff]/35 font-black">-</span>
              <span className="text-[10px] text-white/35 font-bold uppercase tracking-widest">
                Mejor de {summary.bestOfSets}
              </span>
            </div>
            {renderTeam("away")}
          </div>
        </section>

        <section className="rounded-2xl border border-[#00f0ff]/15 bg-[#001122]/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#00f0ff]/10 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Sets del partido</h3>
              <p className="text-[10px] text-white/35 mt-1">
                Set regular a {summary.setPoints}, tie-break a {summary.tiebreakPoints}, diferencia minima de 2.
              </p>
            </div>
            {summary.isComplete && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <CheckCircle size={12} />
                Ganador definido
              </span>
            )}
          </div>

          <div className="divide-y divide-white/5">
            {sets.map((set) => {
              const isLocked = false;
              const homePoints = set.home_points ?? 0;
              const awayPoints = set.away_points ?? 0;
              const isActive = set.set_number === activeSetNumber && !summary.isComplete;

              return (
                <div key={set.set_number} className={`grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[100px_1fr_auto_1fr] gap-3 sm:gap-4 items-center px-4 sm:px-5 py-4 ${isActive ? "bg-[#00f0ff]/5" : ""}`}>
                  <div className="col-span-3 sm:col-span-1 flex items-center justify-between sm:block mb-2 sm:mb-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00f0ff]">Set {set.set_number}</span>
                    <span className="sm:block text-[9px] text-white/35 mt-1">Meta {set.targetPoints}</span>
                  </div>

                  <ScoreInput
                    label={match.home_team?.name || "Local"}
                    value={homePoints}
                    disabled={isLocked}
                    saving={savingKey === `${set.set_number}-home`}
                    onChange={(newVal) => saveSet(set.set_number, newVal, awayPoints, `${set.set_number}-home`)}
                  />

                  <div className="text-center text-xl font-black text-white/30 pt-4">:</div>

                  <ScoreInput
                    label={match.away_team?.name || "Visitante"}
                    value={awayPoints}
                    disabled={isLocked}
                    saving={savingKey === `${set.set_number}-away`}
                    onChange={(newVal) => saveSet(set.set_number, homePoints, newVal, `${set.set_number}-away`)}
                    alignRight
                  />
                </div>
              );
            })}
          </div>
        </section>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}

        <button
          onClick={finishMatch}
          disabled={savingKey === "finish"}
          className="min-h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-5 py-3 text-xs font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500 hover:text-black disabled:opacity-40 disabled:hover:bg-emerald-500/15 disabled:hover:text-emerald-300 transition-all"
        >
          {savingKey === "finish" ? "Finalizando..." : "Finalizar partido"}
        </button>
      </main>
    </div>
  );
}

function ScoreInput({
  label,
  value,
  disabled,
  saving,
  onChange,
  alignRight = false,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  saving?: boolean;
  onChange: (val: number) => void;
  alignRight?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const num = parseInt(localValue, 10);
    if (!isNaN(num) && num !== value) {
      onChange(Math.max(0, num));
    } else {
      setLocalValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="w-full max-w-[120px] mx-auto">
      <span className={`block text-[10px] font-bold uppercase tracking-widest text-white/45 truncate mb-2 ${alignRight ? "text-right" : "text-left"}`}>{label}</span>
      <input
        type="number"
        min="0"
        disabled={disabled || saving}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-[#001122]/80 border ${saving ? 'border-[#00f0ff]/50' : 'border-white/10'} rounded-xl text-center text-3xl sm:text-4xl font-black text-white tabular-nums py-2 outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
    </div>
  );
}
