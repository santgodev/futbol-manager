"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Trophy, Calendar, User, MessageSquare } from "lucide-react";
import { getPendingResultsAction, approveMatchResultAction, rejectMatchResultAction, getCurrentUserProfile } from "../pegasight-actions";

export default function PendingResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reject Modal
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [pending, userProfile] = await Promise.all([
        getPendingResultsAction(),
        getCurrentUserProfile()
      ]);
      setResults(pending);
      setProfile(userProfile);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar resultados pendientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (resultId: string) => {
    try {
      setActionLoading(resultId);
      setErrorMsg(null);
      await approveMatchResultAction(resultId);
      setSuccessMsg("¡Resultado aprobado exitosamente! Ha sido publicado en la vista oficial.");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult || !rejectReason.trim()) return;

    try {
      setActionLoading(selectedResult.id);
      setErrorMsg(null);
      await rejectMatchResultAction(selectedResult.id, rejectReason);
      setSuccessMsg("Resultado rechazado. Se notificó el motivo para su corrección.");
      setSelectedResult(null);
      setRejectReason("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!loading && profile && profile.role === "USUARIO_DE_RESULTADOS") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Bandeja Reservada a Administradores
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            La aprobación y revisión oficial de marcadores está reservada para los Administradores de Torneo. Puedes consultar el estado de tus envíos en <span className="text-[#00f0ff] font-bold">Resultados Enviados</span> o registrar nuevos partidos en <span className="text-purple-400 font-bold">Mis Partidos</span>.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/admin/my-submissions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-[#00f0ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Ver Mis Envíos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Resultados Pendientes
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Revisión, aprobación y control de calidad de marcadores registrados por usuarios de resultados
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar Bandeja
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
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
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs uppercase tracking-widest">Consultando bandeja de entrada...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center gap-4 text-center bg-[#0b1118]/80 border border-white/10 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400/50" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">
              No hay resultados pendientes
            </h3>
            <p className="text-xs text-white/40 mt-1 max-w-md">
              Todos los marcadores enviados en tus torneos han sido procesados y aprobados.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((item) => {
            const isBusy = actionLoading === item.id;
            const match = item.match;
            const homeTeam = match?.home_team;
            const awayTeam = match?.away_team;

            return (
              <div
                key={item.id}
                className="bg-[#0b1118]/90 border border-amber-400/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(251,191,36,0.06)] hover:border-amber-400/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Match & Tournament Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/10 text-amber-400 border border-amber-400/30 uppercase tracking-widest">
                      <Clock size={11} />
                      PENDIENTE DE REVISIÓN
                    </span>
                    <span className="text-[11px] font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1">
                      <Trophy size={12} />
                      {item.tournament?.name}
                    </span>
                    {match?.stage && (
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                        • {match.stage}
                      </span>
                    )}
                  </div>

                  {/* Teams & Score comparison */}
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 max-w-xl">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end text-right">
                      <span className="font-extrabold text-sm text-white truncate">
                        {homeTeam?.name || "Local"}
                      </span>
                      {homeTeam?.logo_url ? (
                        <img src={homeTeam.logo_url} alt="" className="w-8 h-8 rounded-full object-contain bg-white/5" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                          {homeTeam?.name?.[0] || "L"}
                        </div>
                      )}
                    </div>

                    {/* Reported Score */}
                    <div className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/40 rounded-xl text-center shrink-0">
                      <span className="text-xl md:text-2xl font-black text-amber-300 font-mono tracking-wider">
                        {item.home_score} - {item.away_score}
                      </span>
                      {(item.home_penalty_score !== null || item.away_penalty_score !== null) && (
                        <div className="text-[9px] text-amber-200/60 font-mono mt-0.5">
                          Penales: ({item.home_penalty_score ?? 0} - {item.away_penalty_score ?? 0})
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1">
                      {awayTeam?.logo_url ? (
                        <img src={awayTeam.logo_url} alt="" className="w-8 h-8 rounded-full object-contain bg-white/5" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                          {awayTeam?.name?.[0] || "V"}
                        </div>
                      )}
                      <span className="font-extrabold text-sm text-white truncate">
                        {awayTeam?.name || "Visitante"}
                      </span>
                    </div>
                  </div>

                  {/* Submission details */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/50">
                    <span className="flex items-center gap-1.5">
                      <User size={12} className="text-white/40" />
                      Registrado por:{" "}
                      <strong className="text-white/80">
                        {item.submitted_by_profile?.full_name || item.submitted_by_profile?.email || "Usuario"}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-white/40" />
                      {new Date(item.updated_at || item.created_at).toLocaleString("es-ES")}
                    </span>
                    {item.details && (
                      <span className="w-full text-white/70 italic bg-white/5 p-2 rounded-lg border border-white/5">
                        Nota: "{item.details}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end">
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={isBusy}
                    className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isBusy ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Aprobar Resultado
                  </button>

                  <button
                    onClick={() => { setSelectedResult(item); setRejectReason(""); }}
                    disabled={isBusy}
                    className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0f16] border border-red-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={18} />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
                  Rechazar Resultado
                </h3>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-white/40 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60 mb-4">
              Indica el motivo por el cual rechazas este resultado. El usuario de resultados recibirá esta indicación para corregirlo y volverlo a enviar.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  Motivo de Rechazo (Obligatorio)
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ej: El marcador reportado no coincide con el acta del árbitro (fue 2-1, no 3-1)."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === selectedResult.id || !rejectReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === selectedResult.id ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Rechazando...
                    </>
                  ) : (
                    "Confirmar Rechazo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
