"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  Trophy, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  UserPlus, 
  ExternalLink,
  Shield,
  Layers,
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  assignTournamentSuperadminAction, 
  approveMatchResultAction, 
  rejectMatchResultAction 
} from "@/app/admin/pegasight-actions";

export function RoleHierarchyAccordion({ 
  data, 
  onRefresh 
}: { 
  data: any; 
  onRefresh: () => Promise<void> | void;
}) {
  // Expansion states
  const [expandedSuperadmins, setExpandedSuperadmins] = useState<Record<string, boolean>>({});
  const [expandedTournaments, setExpandedTournaments] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state for inline tournament admin actions
  const [rejectModalResultId, setRejectModalResultId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const toggleSuperadmin = (id: string) => {
    setExpandedSuperadmins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTournament = (id: string) => {
    setExpandedTournaments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReassignSuperadmin = async (tourneyId: string, newSuperadminId: string) => {
    try {
      setActionLoading(`reassign-${tourneyId}`);
      await assignTournamentSuperadminAction(tourneyId, newSuperadminId || null);
      await onRefresh();
    } catch (e: any) {
      alert("Error reasignando: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (resultId: string) => {
    try {
      setActionLoading(`approve-${resultId}`);
      await approveMatchResultAction(resultId);
      await onRefresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalResultId || !rejectReason.trim()) return;
    try {
      setActionLoading(`reject-${rejectModalResultId}`);
      await rejectMatchResultAction(rejectModalResultId, rejectReason);
      setRejectModalResultId(null);
      setRejectReason("");
      await onRefresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!data) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. VISTA ADMINISTRADOR GENERAL (Superadmin -> Torneo -> Admins/Anotadores)
  // ═══════════════════════════════════════════════════════════════════════════
  if (data.role === "ADMINISTRADOR_GENERAL") {
    const superadmins = data.superadmins || [];
    const unassigned = data.unassignedTournaments || [];
    const allSuperadmins = superadmins.map((s: any) => ({ id: s.id, name: s.fullName || s.email }));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00f0ff]" />
              Estructura Jerárquica Desplegable
            </h2>
            <p className="text-[11px] text-white/50">
              Vista simplificada: Superadministradores ➔ Torneos adscritos ➔ Administradores y Anotadores
            </p>
          </div>
          <div className="flex items-center gap-3">
            {superadmins.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const allOpen = superadmins.every((s: any) => expandedSuperadmins[s.id]);
                  if (allOpen) {
                    setExpandedSuperadmins({});
                  } else {
                    const next: Record<string, boolean> = {};
                    superadmins.forEach((s: any) => { next[s.id] = true; });
                    setExpandedSuperadmins(next);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                {superadmins.every((s: any) => expandedSuperadmins[s.id]) ? "Contraer Todos" : "Expandir Todos"}
              </button>
            )}
            <Link
              href="/admin/superadmins"
              className="text-xs font-bold text-[#00f0ff] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              Gestionar Superadmins →
            </Link>
          </div>
        </div>

        {superadmins.map((sa: any) => {
          const isExpanded = !!expandedSuperadmins[sa.id];
          const tourneys = sa.tournaments || [];

          return (
            <div
              key={sa.id}
              className="rounded-2xl border border-white/10 bg-[#0b1118]/85 backdrop-blur-xl overflow-hidden transition-all shadow-xl"
            >
              {/* Nivel 1: Superadministrador */}
              <div
                onClick={() => toggleSuperadmin(sa.id)}
                className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-1 rounded-lg bg-white/5 text-[#00f0ff] hover:bg-white/10 transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm md:text-base">
                        {sa.fullName || "Superadministrador"}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        sa.isActive 
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : "bg-red-500/15 border-red-500/30 text-red-300"
                      }`}>
                        {sa.isActive ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>
                    <span className="text-xs text-white/50 font-mono">{sa.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold">
                    <Trophy size={13} className="text-[#00f0ff]" />
                    <span>{tourneys.length} {tourneys.length === 1 ? "Torneo adscrito" : "Torneos adscritos"}</span>
                  </div>
                  <span className="text-[10px] text-[#00f0ff] font-bold uppercase tracking-widest hidden md:inline">
                    {isExpanded ? "Contraer ▲" : "Desplegar ▼"}
                  </span>
                </div>
              </div>

              {/* Nivel 2: Torneos adscritos a este Superadmin */}
              {isExpanded && (
                <div className="border-t border-white/10 bg-black/30 p-4 md:p-6 space-y-3">
                  {tourneys.length === 0 ? (
                    <div className="p-6 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                      Este Superadministrador no tiene torneos adscritos actualmente.
                    </div>
                  ) : (
                    tourneys.map((t: any) => {
                      const isTourneyExpanded = !!expandedTournaments[t.id];
                      const admins = t.tournamentAdmins || [];
                      const results = t.resultUsers || [];

                      return (
                        <div
                          key={t.id}
                          className="rounded-xl border border-[#00f0ff]/15 bg-[#001122]/60 overflow-hidden"
                        >
                          <div
                            onClick={() => toggleTournament(t.id)}
                            className="p-3 md:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[#00f0ff]">
                                {isTourneyExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </span>
                              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white">
                                <Trophy size={15} className="text-[#00f0ff]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs md:text-sm">{t.name}</span>
                                  <span className="text-[9px] uppercase font-mono px-2 py-0.2 rounded bg-black/40 text-white/60 border border-white/10">
                                    {t.sport === "VOLLEYBALL" ? "Voleibol" : "Fútbol"}
                                  </span>
                                  <span className="text-[9px] uppercase font-bold text-emerald-400">
                                    {t.status}
                                  </span>
                                </div>
                                <div className="text-[10px] text-white/40 flex items-center gap-3 mt-0.5">
                                  <span>{t.teamsCount} Equipos</span>
                                  <span>•</span>
                                  <span>{t.matchesCount} Partidos</span>
                                  <span>•</span>
                                  <span className="text-amber-300">{admins.length} Admins</span>
                                  <span>•</span>
                                  <span className="text-purple-300">{results.length} Anotadores</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {/* Reasignar Superadmin */}
                              <select
                                value={sa.id}
                                disabled={actionLoading === `reassign-${t.id}`}
                                onChange={(e) => handleReassignSuperadmin(t.id, e.target.value)}
                                className="text-[10px] bg-black/60 border border-white/15 text-white/80 rounded px-2 py-1 focus:outline-none focus:border-[#00f0ff]"
                                title="Cambiar Superadministrador adscrito"
                              >
                                {allSuperadmins.map((s: any) => (
                                  <option key={s.id} value={s.id}>
                                    Adscrito a: {s.name}
                                  </option>
                                ))}
                                <option value="">Sin Superadmin</option>
                              </select>

                              <Link
                                href={`/admin/tournaments/${t.id}`}
                                className="p-1.5 text-white/60 hover:text-[#00f0ff] transition-colors"
                                title="Abrir Torneo"
                              >
                                <ExternalLink size={14} />
                              </Link>
                            </div>
                          </div>

                          {/* Nivel 3: Usuarios y Administradores del Torneo */}
                          {isTourneyExpanded && (
                            <div className="border-t border-white/10 bg-black/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Admins del Torneo */}
                              <div className="p-3 rounded-lg border border-amber-500/20 bg-[#001122]/80 space-y-2">
                                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                    <Shield size={12} />
                                    Administradores del Torneo ({admins.length})
                                  </span>
                                  <Link
                                    href="/admin/tournament-admins"
                                    className="text-[10px] font-bold text-amber-400 hover:underline"
                                  >
                                    + Asignar
                                  </Link>
                                </div>
                                {admins.length === 0 ? (
                                  <span className="text-[11px] text-white/40 block py-1">Sin administradores vinculados.</span>
                                ) : (
                                  admins.map((adm: any) => (
                                    <div key={adm.membershipId} className="flex items-center justify-between text-[11px] text-white/80 py-0.5">
                                      <span className="font-semibold truncate max-w-[140px]">{adm.fullName || adm.email}</span>
                                      <span className="text-[9px] font-mono text-white/40">{adm.email}</span>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Anotadores (Usuarios de Resultados) */}
                              <div className="p-3 rounded-lg border border-purple-500/20 bg-[#001122]/80 space-y-2">
                                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                    <Users size={12} />
                                    Usuarios de Resultados ({results.length})
                                  </span>
                                  <Link
                                    href="/admin/result-users"
                                    className="text-[10px] font-bold text-purple-400 hover:underline"
                                  >
                                    + Invitar
                                  </Link>
                                </div>
                                {results.length === 0 ? (
                                  <span className="text-[11px] text-white/40 block py-1">Sin anotadores asignados.</span>
                                ) : (
                                  results.map((res: any) => (
                                    <div key={res.membershipId} className="flex items-center justify-between text-[11px] text-white/80 py-0.5">
                                      <span className="font-semibold truncate max-w-[140px]">{res.fullName || res.email}</span>
                                      <span className="text-[9px] font-mono text-white/40">{res.email}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Torneos No Asignados / Directos de la Plataforma */}
        {unassigned.length > 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#0b1118]/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Torneos Directos de la Plataforma (Sin Superadmin asignado: {unassigned.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {unassigned.map((t: any) => (
                <div key={t.id} className="p-3 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-bold text-white text-xs block truncate">{t.name}</span>
                    <span className="text-[9px] text-white/40">{t.sport} • {t.status}</span>
                  </div>
                  <select
                    disabled={actionLoading === `reassign-${t.id}`}
                    onChange={(e) => handleReassignSuperadmin(t.id, e.target.value)}
                    className="text-[10px] bg-black border border-white/20 text-[#00f0ff] rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="" disabled>Adscribir a...</option>
                    {allSuperadmins.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. VISTA SUPERADMINISTRADOR (Torneo adscrito -> Admins y Anotadores)
  // ═══════════════════════════════════════════════════════════════════════════
  if (data.role === "SUPERADMINISTRADOR") {
    const tournaments = data.tournaments || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Torneos Supervisados Desplegables
            </h2>
            <p className="text-[11px] text-white/50">
              Despliega cada torneo para gestionar sus Administradores y Usuarios de Resultados
            </p>
          </div>
          <Link
            href="/admin/tournament-admins"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            + Administradores de Torneo
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1118]/50 p-8 text-center space-y-2">
            <Trophy className="w-8 h-8 text-white/20 mx-auto" />
            <p className="text-sm font-semibold text-white/70">No tienes torneos inscritos o asignados a tu nombre.</p>
            <p className="text-xs text-white/40">Los torneos asignados por el Administrador General o creados por ti aparecerán aquí.</p>
          </div>
        ) : (
          tournaments.map((t: any) => {
          const isExpanded = !!expandedTournaments[t.id];
          const admins = t.tournamentAdmins || [];
          const results = t.resultUsers || [];

          return (
            <div
              key={t.id}
              className="rounded-2xl border border-white/10 bg-[#0b1118]/85 backdrop-blur-xl overflow-hidden transition-all shadow-xl"
            >
              <div
                onClick={() => toggleTournament(t.id)}
                className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <button type="button" className="p-1 rounded-lg bg-white/5 text-emerald-400">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm md:text-base">{t.name}</span>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-white/60 border border-white/10">
                        {t.sport === "VOLLEYBALL" ? "Voleibol" : "Fútbol"}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 flex items-center gap-3 mt-0.5">
                      <span>{t.teamsCount} Equipos</span>
                      <span>•</span>
                      <span>{t.matchesCount} Partidos</span>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">{admins.length} Admins de Torneo</span>
                      <span>•</span>
                      <span className="text-purple-300 font-semibold">{results.length} Anotadores</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/tournaments/${t.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Abrir Torneo <ExternalLink size={12} />
                  </Link>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hidden md:inline">
                    {isExpanded ? "Contraer ▲" : "Desplegar ▼"}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/10 bg-black/40 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Administradores de Torneo */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-[#001122]/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Shield size={14} />
                        Administradores del Torneo ({admins.length})
                      </span>
                      <Link
                        href="/admin/tournament-admins"
                        className="text-[10px] font-bold text-amber-400 hover:underline uppercase"
                      >
                        + Vincular Admin
                      </Link>
                    </div>
                    {admins.length === 0 ? (
                      <p className="text-xs text-white/40 py-2">No hay administradores asignados a este torneo.</p>
                    ) : (
                      admins.map((adm: any) => (
                        <div key={adm.membershipId} className="flex items-center justify-between text-xs text-white/80 py-1">
                          <span className="font-semibold">{adm.fullName || adm.email}</span>
                          <span className="text-white/40 font-mono text-[10px]">{adm.email}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Usuarios de Resultados */}
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-[#001122]/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <Users size={14} />
                        Usuarios de Resultados ({results.length})
                      </span>
                      <Link
                        href="/admin/result-users"
                        className="text-[10px] font-bold text-purple-400 hover:underline uppercase"
                      >
                        + Invitar Anotador
                      </Link>
                    </div>
                    {results.length === 0 ? (
                      <p className="text-xs text-white/40 py-2">No hay anotadores asignados a este torneo.</p>
                    ) : (
                      results.map((res: any) => (
                        <div key={res.membershipId} className="flex items-center justify-between text-xs text-white/80 py-1">
                          <span className="font-semibold">{res.fullName || res.email}</span>
                          <span className="text-white/40 font-mono text-[10px]">{res.email}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. VISTA ADMINISTRADOR DE TORNEO (Torneo -> Anotadores y Pendientes)
  // ═══════════════════════════════════════════════════════════════════════════
  if (data.role === "ADMINISTRADOR_DEL_TORNEO") {
    const tournaments = data.tournaments || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Tus Torneos Asignados
            </h2>
            <p className="text-[11px] text-white/50">
              Despliega cada torneo para revisar Anotadores autorizados y Marcadores pendientes de aprobación
            </p>
          </div>
          <Link
            href="/admin/pending-results"
            className="text-xs font-bold text-amber-400 hover:underline uppercase tracking-wider"
          >
            Bandeja de Pendientes →
          </Link>
        </div>

        {tournaments.map((t: any) => {
          const isExpanded = !!expandedTournaments[t.id];
          const results = t.resultUsers || [];
          const pending = t.pendingResults || [];

          return (
            <div
              key={t.id}
              className="rounded-2xl border border-white/10 bg-[#0b1118]/85 backdrop-blur-xl overflow-hidden transition-all shadow-xl"
            >
              <div
                onClick={() => toggleTournament(t.id)}
                className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <button type="button" className="p-1 rounded-lg bg-white/5 text-amber-400">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm md:text-base">{t.name}</span>
                      <span className="text-[9px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 flex items-center gap-3 mt-0.5">
                      <span>{t.teamsCount} Equipos</span>
                      <span>•</span>
                      <span>{t.matchesCount} Partidos</span>
                      <span>•</span>
                      <span className="text-purple-300 font-semibold">{results.length} Anotadores</span>
                      {pending.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-black animate-pulse">
                            ⚠️ {pending.length} por aprobar
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/tournaments/${t.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Gestionar <ExternalLink size={12} />
                  </Link>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest hidden md:inline">
                    {isExpanded ? "Contraer ▲" : "Desplegar ▼"}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/10 bg-black/40 p-4 md:p-6 space-y-4">
                  {/* Marcadores Pendientes de Aprobación */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-[#001122]/90 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Clock size={14} />
                        Marcadores Pendientes de Aprobación ({pending.length})
                      </span>
                    </div>
                    {pending.length === 0 ? (
                      <p className="text-xs text-white/40 py-1">No hay marcadores pendientes de revisión en este torneo.</p>
                    ) : (
                      <div className="space-y-2">
                        {pending.map((res: any) => (
                          <div
                            key={res.id}
                            className="p-3 rounded-lg bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <span className="text-white/50 text-[10px] block">
                                Partido: {res.match?.match_date} {res.match?.match_time || ""}
                              </span>
                              <span className="font-bold text-white">
                                {res.match?.home_team?.name} <span className="text-[#00f0ff] font-mono px-1.5 py-0.5 rounded bg-white/5">{res.home_score} - {res.away_score}</span> {res.match?.away_team?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(res.id)}
                                disabled={actionLoading === `approve-${res.id}`}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider hover:bg-emerald-400 transition-colors"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalResultId(res.id);
                                  setRejectReason("");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[10px] uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Anotadores (Usuarios de Resultados) */}
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-[#001122]/90 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <Users size={14} />
                        Usuarios de Resultados Asignados ({results.length})
                      </span>
                      <Link
                        href="/admin/result-users"
                        className="text-[10px] font-bold text-purple-400 hover:underline uppercase"
                      >
                        + Invitar Anotador
                      </Link>
                    </div>
                    {results.length === 0 ? (
                      <p className="text-xs text-white/40 py-1">No hay anotadores asignados a este torneo.</p>
                    ) : (
                      results.map((r: any) => (
                        <div key={r.membershipId} className="flex items-center justify-between text-xs text-white/80 py-1">
                          <span className="font-semibold">{r.fullName || r.email}</span>
                          <span className="text-white/40 font-mono text-[10px]">{r.email}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Modal de Rechazo con motivo obligatorio */}
        {rejectModalResultId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b1118] border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                Rechazar Resultado y Solicitar Corrección
              </h3>
              <p className="text-xs text-white/60">
                Indica el motivo de corrección para que el anotador pueda corregir y reenviar el marcador.
              </p>
              <form onSubmit={handleReject} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ej: El marcador real fue 3 - 2, por favor verificar el segundo tiempo..."
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModalResultId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === `reject-${rejectModalResultId}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-red-600 text-white hover:bg-red-500 transition-colors"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. VISTA USUARIO DE RESULTADOS (Torneo -> Partidos para Captura)
  // ═══════════════════════════════════════════════════════════════════════════
  if (data.role === "USUARIO_DE_RESULTADOS") {
    const list = data.tournamentsWithMatches || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              Tus Partidos Organizados por Torneo
            </h2>
            <p className="text-[11px] text-white/50">
              Despliega cada torneo para capturar resultados y verificar observaciones
            </p>
          </div>
          <Link
            href="/admin/my-submissions"
            className="text-xs font-bold text-purple-400 hover:underline uppercase tracking-wider"
          >
            Historial de Envíos →
          </Link>
        </div>

        {list.map((item: any) => {
          const t = item.tournament;
          const matches = item.matches || [];
          const isExpanded = expandedTournaments[t.id] !== false; // Default expanded for scorekeeper

          return (
            <div
              key={t.id}
              className="rounded-2xl border border-white/10 bg-[#0b1118]/85 backdrop-blur-xl overflow-hidden transition-all shadow-xl"
            >
              <div
                onClick={() => toggleTournament(t.id)}
                className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <button type="button" className="p-1 rounded-lg bg-white/5 text-purple-400">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <div>
                    <span className="font-extrabold text-white text-sm">{t.name}</span>
                    <span className="text-[10px] text-white/40 block">
                      {matches.length} {matches.length === 1 ? "partido asignado" : "partidos asignados"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                  {isExpanded ? "Contraer ▲" : "Desplegar ▼"}
                </span>
              </div>

              {isExpanded && (
                <div className="border-t border-white/10 bg-black/40 p-4 space-y-3">
                  {matches.map((m: any) => {
                    const res = Array.isArray(m.match_results) 
                      ? (m.match_results.length > 0 ? m.match_results[0] : null) 
                      : (m.match_results || null);
                    const isRejected = res?.status === "REJECTED";
                    const isPending = res?.status === "PENDING_REVIEW";
                    const isApproved = res?.status === "APPROVED";

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl border border-white/10 bg-[#001122]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-white/50 mb-1">
                            <Calendar size={12} />
                            <span>{m.match_date} {m.match_time || ""}</span>
                            {isRejected && <span className="text-red-400 font-bold uppercase">• RECHAZADO: CORREGIR</span>}
                            {isPending && <span className="text-amber-400 font-bold uppercase">• EN REVISIÓN</span>}
                            {isApproved && <span className="text-emerald-400 font-bold uppercase">• PUBLICADO</span>}
                          </div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{m.home_team?.name}</span>
                            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/15 text-[#00f0ff] font-mono text-xs">
                              {res ? `${res.home_score} - ${res.away_score}` : "VS"}
                            </span>
                            <span>{m.away_team?.name}</span>
                          </div>
                          {res?.rejection_reason && (
                            <p className="text-[11px] text-red-300 bg-red-950/20 border border-red-900/30 p-2 rounded-lg mt-2">
                              Motivo del Administrador: {res.rejection_reason}
                            </p>
                          )}
                        </div>

                        <Link
                          href="/admin/submit-result"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-[#00f0ff] text-black font-extrabold text-xs uppercase tracking-wider text-center hover:scale-[1.02] transition-transform"
                        >
                          {isRejected ? "Corregir Marcador" : res ? "Ver Detalle" : "Registrar"}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
