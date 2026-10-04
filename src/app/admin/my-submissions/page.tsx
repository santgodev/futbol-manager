"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Clock, XCircle, Trophy, RefreshCw, Calendar, MessageSquare } from "lucide-react";
import { getMyAssignedMatchesAction } from "../pegasight-actions";

export default function MySubmissionsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMyAssignedMatchesAction();
      const submitted = data.filter((m: any) => {
        const res = Array.isArray(m.match_results) 
          ? (m.match_results.length > 0 ? m.match_results[0] : null) 
          : (m.match_results || null);
        return !!res;
      });
      setMatches(submitted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-8 h-8 text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Resultados Enviados
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Historial de resultados capturados y estado de aprobación del comité de torneos
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-white/40 bg-[#0b1118]/80 border border-white/10 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00f0ff]" />
          <span className="text-xs uppercase tracking-widest">Cargando envíos...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-16 text-center text-white/40 bg-[#0b1118]/80 border border-white/10 rounded-2xl text-xs uppercase tracking-widest">
          Aún no has enviado resultados en esta cuenta.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {matches.map((m: any) => {
            const result = Array.isArray(m.match_results) 
              ? (m.match_results.length > 0 ? m.match_results[0] : null) 
              : (m.match_results || null);
            const isApproved = result?.status === "APPROVED";
            const isPending = result?.status === "PENDING_REVIEW";
            const isRejected = result?.status === "REJECTED";

            return (
              <div
                key={m.id}
                className="bg-[#0b1118]/90 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00f0ff]">
                    <Trophy size={13} />
                    <span>{m.tournament?.name}</span>
                    <span className="text-white/40">• {m.match_date}</span>
                  </div>

                  <div className="text-sm font-extrabold text-white flex items-center gap-3">
                    <span>{m.home_team?.name}</span>
                    <span className="px-2.5 py-0.5 rounded bg-black/60 border border-white/20 text-[#00f0ff] font-mono">
                      {result.home_score} - {result.away_score}
                    </span>
                    <span>{m.away_team?.name}</span>
                  </div>

                  {result.rejection_reason && (
                    <div className="text-xs text-red-300 bg-red-950/20 border border-red-900/30 p-2 rounded-lg flex items-start gap-1.5">
                      <MessageSquare size={13} className="shrink-0 mt-0.5" />
                      <span>Motivo del rechazo: {result.rejection_reason}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  {isApproved && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={14} />
                      APROBADO
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                      <Clock size={14} />
                      PENDIENTE DE REVISIÓN
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                      <XCircle size={14} />
                      RECHAZADO
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
