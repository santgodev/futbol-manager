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
  Eye,
  List
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
  
  // Filtros
  const [searchFilter, setSearchFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

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

  const translateAction = (action: string) => {
    if (!action) return "DESCONOCIDA";
    const translations: Record<string, string> = {
      "ASSIGN_TOURNAMENT_MEMBER": "ASIGNAR MIEMBRO A TORNEO",
      "REMOVE_TOURNAMENT_MEMBER": "REMOVER MIEMBRO DE TORNEO",
      "CREATE_TOURNAMENT": "CREAR TORNEO",
      "UPDATE_TOURNAMENT": "ACTUALIZAR TORNEO",
      "CREATE_TEAM": "CREAR EQUIPO",
      "UPDATE_TEAM": "ACTUALIZAR EQUIPO",
      "CREATE_MATCH": "CREAR PARTIDO",
      "UPDATE_MATCH": "ACTUALIZAR PARTIDO",
      "APPROVED": "APROBADO",
      "REJECTED": "RECHAZADO",
      "SUBMITTED": "REGISTRADO",
      "ACTIVATED": "ACTIVADO",
      "DEACTIVATED": "DESACTIVADO",
    };
    return translations[action] || action;
  };

  const translateKey = (key: string) => {
    const normalizedKey = key.toLowerCase().replace(/ /g, '_');
    const translations: Record<string, string> = {
      "role": "Rol",
      "tournament_name": "Nombre del Torneo",
      "team_name": "Nombre del Equipo",
      "status": "Estado",
      "reason": "Motivo",
      "previous_status": "Estado Anterior",
      "new_status": "Nuevo Estado",
      "match_id": "ID del Partido",
      "team_id": "ID del Equipo",
      "user_id": "ID del Usuario",
      "tournament_id": "ID del Torneo",
      "score_a": "Goles Equipo A",
      "score_b": "Goles Equipo B",
      "details": "Detalles",
      "name": "Nombre",
      "description": "Descripción",
      "type": "Tipo",
      "is_active": "Está Activo",
      "is_public": "Es Público",
      "start_date": "Fecha de Inicio",
      "end_date": "Fecha de Fin",
      "email": "Correo Electrónico",
      "user": "Usuario",
      "admin": "Administrador",
      "created_at": "Fecha de Creación",
      "updated_at": "Última Actualización",
      "group_name": "Grupo / Fase",
      "match_date": "Fecha del Partido"
    };
    return translations[normalizedKey] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionBadge = (action: string) => {
    if (!action) return null;
    const translated = translateAction(action);
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
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">{translated}</span>;
  };

  const filteredSystem = systemLogs.filter((log) => {
    if (searchFilter) {
      const term = searchFilter.toLowerCase();
      const match = log.action?.toLowerCase().includes(term) ||
        log.entity_type?.toLowerCase().includes(term) ||
        log.actor_profile?.email?.toLowerCase().includes(term) ||
        log.actor_profile?.full_name?.toLowerCase().includes(term);
      if (!match) return false;
    }
    if (actionFilter && log.action !== actionFilter) return false;
    if (entityFilter && log.entity_type !== entityFilter) return false;
    return true;
  });

  const filteredResults = resultLogs.filter((log) => {
    if (searchFilter) {
      const term = searchFilter.toLowerCase();
      const match = log.action?.toLowerCase().includes(term) ||
        log.reason?.toLowerCase().includes(term) ||
        log.performed_by_profile?.email?.toLowerCase().includes(term) ||
        log.performed_by_profile?.full_name?.toLowerCase().includes(term);
      if (!match) return false;
    }
    if (actionFilter && log.action !== actionFilter) return false;
    return true;
  });

  const uniqueSystemActions = Array.from(new Set(systemLogs.map(l => l.action).filter(Boolean)));
  const uniqueSystemEntities = Array.from(new Set(systemLogs.map(l => l.entity_type).filter(Boolean)));
  const uniqueResultActions = Array.from(new Set(resultLogs.map(l => l.action).filter(Boolean)));

  const renderDataList = (data: any) => {
    if (!data) return <p className="text-white/50 text-sm italic">No hay datos adicionales.</p>;
    if (typeof data !== 'object') return <p className="text-white font-medium">{String(data)}</p>;
    
    // Si es un log de resultados que pasamos directo, limpiamos campos técnicos
    const cleanData = { ...data };
    delete cleanData.id;
    delete cleanData.created_at;
    delete cleanData.updated_at;
    delete cleanData.actor_id;
    delete cleanData.performed_by;
    delete cleanData.actor_profile;
    delete cleanData.performed_by_profile;

    const entries = Object.entries(cleanData);
    if (entries.length === 0) return <p className="text-white/50 text-sm italic">Objeto vacío.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map(([key, value]) => {
          let displayValue = String(value);
          if (value === null || value === undefined || value === "") displayValue = "Ninguno / Vacío";
          else if (typeof value === 'boolean') displayValue = value ? "Sí" : "No";
          else if (typeof value === 'object') displayValue = JSON.stringify(value);

          const formattedKey = translateKey(key);

          return (
            <div key={key} className="bg-[#001122] rounded-xl p-3 border border-white/5 shadow-inner">
              <div className="text-[10px] text-[#00f0ff] uppercase tracking-wider font-black mb-1">{formattedKey}</div>
              <div className="text-sm text-white font-medium break-words">{displayValue}</div>
            </div>
          );
        })}
      </div>
    );
  };

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

      {/* Controles de Filtros */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-[#001122]/60 p-4 rounded-2xl border border-[#00f0ff]/15">
        <div className="flex items-center gap-2 p-1 bg-[#001122]/80 border border-[#00f0ff]/20 rounded-xl overflow-hidden shrink-0">
          <button
            onClick={() => { setTab("system"); setActionFilter(""); setEntityFilter(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "system"
                ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldAlert size={14} />
            Acciones ({systemLogs.length})
          </button>
          <button
            onClick={() => { setTab("results"); setActionFilter(""); setEntityFilter(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "results"
                ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <History size={14} />
            Marcadores ({resultLogs.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 min-w-[150px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f0ff]/50" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#001122] border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
            />
          </div>
          
          <div className="flex-1 lg:w-40 min-w-[130px] relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f0ff]/50 z-10" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#001122] border border-white/10 text-white text-xs focus:outline-none focus:border-[#00f0ff]/50 appearance-none cursor-pointer relative"
            >
              <option value="">Todas las acciones</option>
              {(tab === "system" ? uniqueSystemActions : uniqueResultActions).map(act => (
                <option key={act as string} value={act as string}>{translateAction(act as string)}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div>
          </div>

          {tab === "system" && (
            <div className="flex-1 lg:w-40 min-w-[130px] relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f0ff]/50 z-10" />
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#001122] border border-white/10 text-white text-xs focus:outline-none focus:border-[#00f0ff]/50 appearance-none cursor-pointer relative"
              >
                <option value="">Todas las entidades</option>
                {uniqueSystemEntities.map(ent => (
                  <option key={ent as string} value={ent as string}>{ent}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div>
            </div>
          )}
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
              No se encontraron registros de auditoría con los filtros actuales
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
                        <div className="font-bold text-white flex items-center gap-2">
                          <User size={10} className="text-[#00f0ff]" />
                          {log.actor_profile?.full_name || "Desconocido"}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">
                          {log.actor_profile?.email || log.actor_id}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-white/70 text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {log.entity_type} {log.entity_id ? `(#${log.entity_id.substring(0, 5)})` : ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                        >
                          <List size={12} /> Ver Detalles
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
              No se encontró historial de marcadores con los filtros actuales
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
                        <span className="text-white/40 px-1.5 py-0.5 rounded bg-white/5">{log.previous_status || "INICIAL"}</span>
                        <span className="text-[#00f0ff] mx-1">→</span>
                        <span className="text-white font-bold px-1.5 py-0.5 rounded bg-white/10">{log.new_status}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-2">
                          <User size={10} className="text-[#00f0ff]" />
                          {log.performed_by_profile?.full_name || "Desconocido"}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">
                          {log.performed_by_profile?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-white/70">
                        {log.reason ? (
                          <span className="text-rose-400 italic font-mono text-[11px] bg-rose-500/5 px-2 py-1 rounded">"{log.reason}"</span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                        >
                          <List size={12} /> Ver Detalles
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

      {/* Modal de Detalle Moderno */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#001122] border border-[#00f0ff]/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
                  <List size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Detalles del Registro
                  </h3>
                  <p className="text-[11px] text-white/40 font-mono mt-0.5">
                    {translateAction(selectedLog.action)} • {new Date(selectedLog.created_at).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User size={12} /> Información del Actor
                </h4>
                <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-[#001122] border border-white/10 flex items-center justify-center text-white/50">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {selectedLog.actor_profile?.full_name || selectedLog.performed_by_profile?.full_name || "Usuario Desconocido"}
                    </div>
                    <div className="text-[11px] text-white/50 font-mono mt-0.5">
                      {selectedLog.actor_profile?.email || selectedLog.performed_by_profile?.email || "Sin email"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileText size={12} /> Datos del Evento
                </h4>
                {renderDataList(selectedLog.details || selectedLog.new_data || { 
                  estado_anterior: selectedLog.previous_status, 
                  estado_nuevo: selectedLog.new_status,
                  motivo: selectedLog.reason,
                  ...selectedLog
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/10 p-4 bg-white/[0.02] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
