"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Edit3, Send, Trophy, RefreshCw } from "lucide-react";
import { getMyAssignedMatchesAction, submitMatchResultAction } from "../pegasight-actions";

export default function MyMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal de captura / corrección
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homePenalties, setHomePenalties] = useState<number | null>(null);
  const [awayPenalties, setAwayPenalties] = useState<number | null>(null);
  const [details, setDetails] = useState<string>("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getMyAssignedMatchesAction();
      setMatches(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar partidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const openModal = (match: any) => {
    const existing = Array.isArray(match.match_results) 
      ? (match.match_results.length > 0 ? match.match_results[0] : null) 
      : (match.match_results || null);
    setActiveMatch(match);
    setHomeScore(existing ? existing.home_score : (match.home_score || 0));
    setAwayScore(existing ? existing.away_score : (match.away_score || 0));
    setHomePenalties(existing?.home_penalty_score ?? null);
    setAwayPenalties(existing?.away_penalty_score ?? null);
    setDetails(existing?.details || "");
    setErrorMsg(null);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;

    try {
      setActionLoading(activeMatch.id);
      setErrorMsg(null);
      await submitMatchResultAction({
        matchId: activeMatch.id,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        homePenalties: homePenalties !== null ? Number(homePenalties) : null,
        awayPenalties: awayPenalties !== null ? Number(awayPenalties) : null,
        details: details.trim() || undefined
      });

      setSuccessMsg("Marcador enviado correctamente. Estado: PENDIENTE DE REVISIÓN.");
      setActiveMatch(null);
      await loadMatches();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="w-8 h-8 text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Mis Partidos Asignados
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Captura y corrección de resultados en tus torneos autorizados
          </p>
        </div>

        <button
          onClick={loadMatches}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refrescar Lista
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-white/40 bg-[#0b1118]/80 border border-white/10 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00f0ff]" />
          <span className="text-xs uppercase tracking-widest">Cargando partidos...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center gap-4 text-center bg-[#0b1118]/80 border border-white/10 rounded-2xl">
          <Calendar className="w-12 h-12 text-white/20" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">
              No tienes partidos disponibles
            </h3>
            <p className="text-xs text-white/40 mt-1 max-w-md">
              Asegúrate de que un administrador te haya asignado a un torneo activo.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m: any) => {
            const result = Array.isArray(m.match_results) 
              ? (m.match_results.length > 0 ? m.match_results[0] : null) 
              : (m.match_results || null);
            const isApproved = result?.status === "APPROVED";
            const isPending = result?.status === "PENDING_REVIEW";
            const isRejected = result?.status === "REJECTED";
            const hasNoResult = !result;

            return (
              <div
                key={m.id}
                className="bg-[#0b1118]/90 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between gap-4"
              >
                {/* Header card */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy size={12} />
                    {m.tournament?.name}
                  </span>
                  <div className="text-[10px] text-white/50 flex items-center gap-1 font-mono">
                    <Calendar size={11} />
                    {m.match_date || "Fecha por definir"}
                  </div>
                </div>

                {/* Teams & Current/Reported Score */}
                <div className="flex items-center justify-between gap-3 px-2 py-2">
                  <div className="flex items-center gap-2 flex-1">
                    {m.home_team?.logo_url ? (
                      <img src={m.home_team.logo_url} alt="" className="w-7 h-7 rounded-full object-contain bg-white/5" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {m.home_team?.name?.[0] || "L"}
                      </div>
                    )}
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {m.home_team?.name || "Local"}
                    </span>
                  </div>

                  <div className="text-center px-3 py-1 bg-black/50 border border-white/10 rounded-lg shrink-0">
                    <span className="text-base font-black font-mono text-white">
                      {result ? `${result.home_score} - ${result.away_score}` : (m.home_score !== null ? `${m.home_score} - ${m.away_score}` : "- vs -")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end text-right">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {m.away_team?.name || "Visitante"}
                    </span>
                    {m.away_team?.logo_url ? (
                      <img src={m.away_team.logo_url} alt="" className="w-7 h-7 rounded-full object-contain bg-white/5" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {m.away_team?.name?.[0] || "V"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges & Warnings */}
                <div>
                  {isApproved && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={13} />
                      RESULTADO APROBADO (OFICIAL)
                    </div>
                  )}

                  {isPending && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                      <Clock size={13} />
                      PENDIENTE DE REVISIÓN POR EL ADMINISTRADOR
                    </div>
                  )}

                  {isRejected && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                        <XCircle size={13} />
                        RESULTADO RECHAZADO
                      </div>
                      {result.rejection_reason && (
                        <p className="text-[11px] text-red-300/80 bg-red-950/20 border border-red-900/30 p-2 rounded-lg italic">
                          Motivo: "{result.rejection_reason}"
                        </p>
                      )}
                    </div>
                  )}

                  {hasNoResult && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                      SIN RESULTADO REGISTRADO
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-2 border-t border-white/5 flex justify-end">
                  {isApproved ? (
                    <span className="text-[10px] text-white/30 italic font-semibold">
                      Publicado • No modificable
                    </span>
                  ) : (
                    <button
                      onClick={() => openModal(m)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        isRejected
                          ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                          : isPending
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30"
                          : "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      }`}
                    >
                      <Edit3 size={13} />
                      {isRejected ? "Corregir Marcador" : isPending ? "Modificar Marcador" : "Registrar Marcador"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Captura de Marcador */}
      {activeMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0a0f16] border border-[#00f0ff]/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-[9px] font-bold text-[#00f0ff] uppercase tracking-widest">
                  {activeMatch.tournament?.name}
                </span>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
                  Registrar Marcador
                </h3>
              </div>
              <button
                onClick={() => setActiveMatch(null)}
                className="text-white/40 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="space-y-5">
              {/* Score inputs */}
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
                <div className="text-center space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/90 truncate">
                    {activeMatch.home_team?.name || "Local"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 mx-auto text-center text-3xl font-black font-mono py-2 rounded-xl bg-black/80 border border-white/20 text-[#00f0ff] focus:border-[#00f0ff] focus:outline-none"
                  />
                  <span className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Goles / Puntos</span>
                </div>

                <div className="text-center space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/90 truncate">
                    {activeMatch.away_team?.name || "Visitante"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 mx-auto text-center text-3xl font-black font-mono py-2 rounded-xl bg-black/80 border border-white/20 text-[#00f0ff] focus:border-[#00f0ff] focus:outline-none"
                  />
                  <span className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Goles / Puntos</span>
                </div>
              </div>

              {/* Optional Penalties */}
              <div className="border border-white/5 rounded-xl p-3 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">
                  Definición por Penales (Opcional)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Penales Local</label>
                    <input
                      type="number"
                      min={0}
                      value={homePenalties ?? ""}
                      onChange={(e) => setHomePenalties(e.target.value === "" ? null : parseInt(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/60 mb-1">Penales Visitante</label>
                    <input
                      type="number"
                      min={0}
                      value={awayPenalties ?? ""}
                      onChange={(e) => setAwayPenalties(e.target.value === "" ? null : parseInt(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Details / Observations */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5">
                  Observaciones / Notas del Partido
                </label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Ej: Finalizó tiempo reglamentario sin incidentes."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#00f0ff] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Clock size={12} />
                  Se enviará a revisión del administrador
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveMatch(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === activeMatch.id}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {actionLoading === activeMatch.id ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Enviar Resultado
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
