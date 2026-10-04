"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  History, 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye
} from "lucide-react";
import { getAuditLogsAction, getResultHistoryAction, getCurrentUserProfile } from "@/app/admin/pegasight-actions";
import Link from "next/link";

export default function AuditLogsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<"system" | "results">("system");
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [resultLogs, setResultLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile);

      if (userProfile?.role === "ADMINISTRADOR_GENERAL" || userProfile?.role === "SUPERADMINISTRADOR") {
        const [sys, res] = await Promise.all([
          getAuditLogsAction(100),
          getResultHistoryAction()
        ]);
        setSystemLogs(sys);
        setResultLogs(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVED")) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">APROBADO</span>;
    }
    if (action.includes("REJECTED")) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">RECHAZADO</span>;
    }
    if (action.includes("SUBMITTED")) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">REGISTRADO</span>;
    }
    if (action.includes("ACTIVATED")) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ACTIVADO</span>;
    }
    if (action.includes("DEACTIVATED")) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">DESACTIVADO</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">{action}</span>;
  };

  const filteredSystem = systemLogs.filter((log) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.entity_type?.toLowerCase().includes(term) ||
      log.actor_profile?.email?.toLowerCase().includes(term) ||
      log.actor_profile?.full_name?.toLowerCase().includes(term)
    );
  });

  const filteredResults = resultLogs.filter((log) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.reason?.toLowerCase().includes(term) ||
      log.performed_by_profile?.email?.toLowerCase().includes(term) ||
      log.performed_by_profile?.full_name?.toLowerCase().includes(term)
    );
  });

  if (!loading && profile && profile.role !== "ADMINISTRADOR_GENERAL" && profile.role !== "SUPERADMINISTRADOR") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Acceso Restringido a la Auditoría Global
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            El visor de auditoría administrativa y trazabilidad inmutable está reservado a los <span className="text-[#00f0ff] font-bold">Superadministradores</span> y al <span className="text-[#00f0ff] font-bold">Administrador General</span>.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs tracking-wider uppercase transition-all"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00f0ff]/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff]">
              Trazabilidad y Seguridad
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Auditoría del Sistema
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Registro cronológico inmutable de acciones administrativas y cambios de estado en marcadores
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-[#001122]/60 border border-[#00f0ff]/15 rounded-xl">
          <button
            onClick={() => setTab("system")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "system"
                ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldAlert size={14} />
            Acciones de Admins ({systemLogs.length})
          </button>
          <button
            onClick={() => setTab("results")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "results"
                ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <History size={14} />
            Historial de Marcadores ({resultLogs.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Filtrar por usuario, acción..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#001122]/80 border border-[#00f0ff]/20 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#00f0ff]"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Contenido según tab */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-[#00f0ff]" />
          <span className="text-white/40 text-xs uppercase tracking-widest font-mono">Cargando registros...</span>
        </div>
      ) : tab === "system" ? (
        /* Tabla de Auditoría del Sistema */
        <div className="rounded-2xl border border-[#00f0ff]/15 bg-[#001122]/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          {filteredSystem.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-xs uppercase tracking-widest font-mono">
              No hay registros de auditoría administrativa disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#00f0ff]/10 bg-white/[0.02] text-white/50 uppercase tracking-widest text-[10px]">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Administrador</th>
                    <th className="py-3 px-4">Entidad</th>
                    <th className="py-3 px-4 text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00f0ff]/5">
                  {filteredSystem.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-white/60 text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">
                          {log.actor_profile?.full_name || "Desconocido"}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">
                          {log.actor_profile?.email || log.actor_id}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-white/70 text-[11px] bg-white/5 px-2 py-0.5 rounded">
                          {log.entity_type}: {log.entity_id ? log.entity_id.substring(0, 8) + "..." : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-all"
                        >
                          <Eye size={12} /> Ver JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tabla de Historial de Marcadores */
        <div className="rounded-2xl border border-[#00f0ff]/15 bg-[#001122]/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          {filteredResults.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-xs uppercase tracking-widest font-mono">
              No hay historial de modificaciones de marcadores disponible
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#00f0ff]/10 bg-white/[0.02] text-white/50 uppercase tracking-widest text-[10px]">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Transición Estado</th>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Motivo / Comentario</th>
                    <th className="py-3 px-4 text-right">Datos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00f0ff]/5">
                  {filteredResults.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-white/60 text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                        <span className="text-white/40">{log.previous_status || "INICIAL"}</span>
                        <span className="text-[#00f0ff] mx-1">→</span>
                        <span className="text-white font-bold">{log.new_status}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">
                          {log.performed_by_profile?.full_name || "Desconocido"}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">
                          {log.performed_by_profile?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-white/70">
                        {log.reason ? (
                          <span className="text-rose-400 italic font-mono text-[11px]">"{log.reason}"</span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-all"
                        >
                          <Eye size={12} /> Ver Snapshot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalle JSON */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#001122] border border-[#00f0ff]/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Detalles del Registro #{selectedLog.id?.substring(0, 8)}
                </h3>
                <p className="text-[11px] text-white/40 font-mono mt-0.5">
                  {selectedLog.action} • {new Date(selectedLog.created_at).toLocaleString("es-ES")}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white/50 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-black/60 rounded-xl p-4 border border-white/5">
              <pre className="text-[11px] font-mono text-[#00f0ff]/90 whitespace-pre-wrap break-words">
                {JSON.stringify(selectedLog.details || selectedLog.new_data || selectedLog, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
