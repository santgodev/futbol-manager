"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  UserX, 
  UserCheck, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Shield, 
  Link2, 
  Trash2,
  Lock,
  Mail,
  User,
  X
} from "lucide-react";
import { 
  getTournamentAdminsAction, 
  createTournamentAdminAction, 
  toggleUserStatusAction, 
  assignTournamentAdminAction,
  unassignTournamentAdminAction,
  getCurrentUserProfile 
} from "../pegasight-actions";
import { createClient } from "@/utils/supabase/client";

interface TournamentAdmin {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  memberships: {
    membershipId: string;
    tournamentId: string;
    tournamentName: string;
    tournamentSlug: string;
    status: string;
    assignedAt: string;
  }[];
}

interface TournamentOption {
  id: string;
  name: string;
  slug: string;
}

export default function TournamentAdminsPage() {
  const [admins, setAdmins] = useState<TournamentAdmin[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignModalAdmin, setAssignModalAdmin] = useState<TournamentAdmin | null>(null);
  
  // Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for creation
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formTournamentId, setFormTournamentId] = useState("");

  // Form state for assignment
  const [selectedAssignTournamentId, setSelectedAssignTournamentId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [adminsData, profile] = await Promise.all([
        getTournamentAdminsAction(),
        getCurrentUserProfile()
      ]);

      setAdmins(adminsData);
      setCurrentUser(profile);

      // Load tournaments list for selectors
      const supabase = createClient();
      let tourneyQuery = supabase
        .from("tournaments")
        .select("id, name, slug")
        .order("name", { ascending: true });

      const { data: tourneys } = await tourneyQuery;
      
      setTournaments(tourneys || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar administradores de torneo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading("create");
      setErrorMsg(null);
      await createTournamentAdminAction({
        email: formEmail,
        password: formPassword,
        full_name: formName,
        tournamentId: formTournamentId || undefined
      });

      setSuccessMsg(`Administrador de torneo ${formName} creado correctamente.`);
      setIsCreateModalOpen(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormTournamentId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (admin: TournamentAdmin) => {
    try {
      setActionLoading(admin.id);
      setErrorMsg(null);
      await toggleUserStatusAction(admin.id, admin.is_active);
      setSuccessMsg(`Estado de ${admin.full_name || admin.email} actualizado.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalAdmin || !selectedAssignTournamentId) return;

    try {
      setActionLoading("assign");
      setErrorMsg(null);
      await assignTournamentAdminAction({
        tournamentId: selectedAssignTournamentId,
        email: assignModalAdmin.email
      });

      setSuccessMsg(`Torneo asignado exitosamente a ${assignModalAdmin.full_name || assignModalAdmin.email}.`);
      setAssignModalAdmin(null);
      setSelectedAssignTournamentId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassignTournament = async (membershipId: string, adminName: string, tourneyName: string) => {
    if (!confirm(`¿Deseas desvincular a ${adminName} del torneo ${tourneyName}?`)) return;

    try {
      setActionLoading(membershipId);
      setErrorMsg(null);
      await unassignTournamentAdminAction(membershipId);
      setSuccessMsg(`Desvinculado del torneo correctamente.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!loading && currentUser && currentUser.role !== "ADMINISTRADOR_GENERAL" && currentUser.role !== "SUPERADMINISTRADOR") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Acceso Reservado a la Administración Global
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            La creación y asignación de Administradores de Torneo es una función exclusiva del <span className="text-[#00f0ff] font-bold">Superadministrador</span> y <span className="text-[#00f0ff] font-bold">Administrador General</span>.
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Administradores de Torneo
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Crea credenciales y asigna administradores a los torneos de la plataforma
          </p>
        </div>

        <button
          onClick={() => { setIsCreateModalOpen(true); setErrorMsg(null); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={16} />
          Nuevo Administrador de Torneo
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

      {/* Admins List */}
      <div className="bg-[#0b1118]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-400/80">
            Administradores Registrados ({admins.length})
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="text-white/40 hover:text-amber-400 transition-colors p-1.5"
            title="Refrescar lista"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-white/40">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs uppercase tracking-widest">Cargando administradores...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs uppercase tracking-widest">
            No se han registrado administradores de torneo aún. Crea uno nuevo arriba.
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-white/40 font-bold uppercase tracking-widest text-[9px] border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Administrador</th>
                  <th className="py-3.5 px-6">Correo Electrónico</th>
                  <th className="py-3.5 px-6">Torneos Asignados</th>
                  <th className="py-3.5 px-6">Estado Cuenta</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => {
                  const isBusy = actionLoading === admin.id;

                  return (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 font-semibold text-white/90">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Shield size={14} />
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block">{admin.full_name || "Sin nombre"}</span>
                            <span className="text-[10px] text-amber-400/80 font-medium">ADMIN TORNEO</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/60 font-mono text-[11px]">
                        {admin.email}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {admin.memberships.length === 0 ? (
                            <span className="text-[10px] text-white/30 italic">Sin torneo asignado</span>
                          ) : (
                            admin.memberships.map((m) => (
                              <span
                                key={m.membershipId}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-white/80 group-hover:border-white/20 transition-all"
                              >
                                <Trophy size={11} className="text-amber-400" />
                                <span>{m.tournamentName}</span>
                                <button
                                  onClick={() => handleUnassignTournament(m.membershipId, admin.full_name || admin.email, m.tournamentName)}
                                  disabled={actionLoading === m.membershipId}
                                  className="text-white/30 hover:text-red-400 transition-colors ml-0.5"
                                  title="Desvincular torneo"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))
                          )}
                          <button
                            onClick={() => { setAssignModalAdmin(admin); setSelectedAssignTournamentId(""); }}
                            className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/20 transition-all uppercase tracking-wider font-bold"
                          >
                            <Link2 size={10} />
                            + Asignar
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {admin.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            INACTIVO
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            admin.is_active
                              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {isBusy ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : admin.is_active ? (
                            <>
                              <UserX size={12} />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} />
                              Activar
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Administrador de Torneo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1622] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Nuevo Administrador de Torneo
                  </h3>
                  <span className="text-[10px] text-white/50">Crea las credenciales y asigna el torneo</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Carlos Valderrama"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin_torneo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Contraseña Inicial
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Torneo Asignado (Opcional)
                </label>
                <select
                  value={formTournamentId}
                  onChange={(e) => setFormTournamentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b1118] border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="">-- Sin torneo inicial --</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "create"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] disabled:opacity-50 transition-all"
                >
                  {actionLoading === "create" ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Crear Credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar Torneo Adicional */}
      {assignModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1622] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Link2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Asignar Torneo
                  </h3>
                  <span className="text-[10px] text-white/50">
                    A: {assignModalAdmin.full_name || assignModalAdmin.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAssignModalAdmin(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignTournament} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Selecciona el Torneo
                </label>
                <select
                  required
                  value={selectedAssignTournamentId}
                  onChange={(e) => setSelectedAssignTournamentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b1118] border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="">-- Elige un torneo --</option>
                  {tournaments
                    .filter((t) => !assignModalAdmin.memberships.some((m) => m.tournamentId === t.id))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssignModalAdmin(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "assign" || !selectedAssignTournamentId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] disabled:opacity-50 transition-all"
                >
                  {actionLoading === "assign" ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Link2 size={14} />
                  )}
                  Asignar Torneo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
