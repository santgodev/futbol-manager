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
  ShieldAlert, 
  Link2, 
  X, 
  Mail, 
  User, 
  Lock 
} from "lucide-react";
import { 
  getResultUsersAction, 
  createResultUserAction, 
  assignResultUserAction, 
  unassignResultUserAction, 
  toggleUserStatusAction, 
  getCurrentUserProfile 
} from "../pegasight-actions";
import { createClient } from "@/utils/supabase/client";

interface ResultUser {
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

export default function ResultUsersPage() {
  const [users, setUsers] = useState<ResultUser[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignModalUser, setAssignModalUser] = useState<ResultUser | null>(null);

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

      const [usersData, profile] = await Promise.all([
        getResultUsersAction(),
        getCurrentUserProfile()
      ]);

      setUsers(usersData);
      setCurrentUser(profile);

      // Cargar lista de torneos autorizados para el selector según el rol
      const supabase = createClient();
      let tourneysList: TournamentOption[] = [];

      if (profile?.role === "ADMINISTRADOR_GENERAL" || profile?.role === "SUPERADMINISTRADOR") {
        const { data: allTourneys } = await supabase
          .from("tournaments")
          .select("id, name, slug")
          .order("name", { ascending: true });
        tourneysList = allTourneys || [];
      } else if (profile?.role === "ADMINISTRADOR_DEL_TORNEO") {
        const assignedIds = (profile.memberships || [])
          .filter((m: any) => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE")
          .map((m: any) => m.tournament_id);

        if (assignedIds.length > 0) {
          const { data: myTourneys } = await supabase
            .from("tournaments")
            .select("id, name, slug")
            .in("id", assignedIds)
            .order("name", { ascending: true });
          tourneysList = myTourneys || [];
        }
      }

      setTournaments(tourneysList);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar usuarios de resultados.");
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
      await createResultUserAction({
        email: formEmail,
        password: formPassword,
        full_name: formName,
        tournamentId: formTournamentId || undefined
      });

      setSuccessMsg(`Usuario de resultados ${formName} creado correctamente.`);
      setIsCreateModalOpen(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormTournamentId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar el usuario.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user: ResultUser) => {
    try {
      setActionLoading(user.id);
      setErrorMsg(null);
      await toggleUserStatusAction(user.id, user.is_active);
      setSuccessMsg(`Estado de ${user.full_name || user.email} actualizado.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar estado.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalUser || !selectedAssignTournamentId) return;

    try {
      setActionLoading("assign");
      setErrorMsg(null);
      await assignResultUserAction({
        tournamentId: selectedAssignTournamentId,
        email: assignModalUser.email
      });

      setSuccessMsg(`Torneo asignado exitosamente a ${assignModalUser.full_name || assignModalUser.email}.`);
      setAssignModalUser(null);
      setSelectedAssignTournamentId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al asignar torneo.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassignTournament = async (membershipId: string, userName: string, tourneyName: string) => {
    if (!confirm(`¿Deseas desvincular a ${userName} del torneo ${tourneyName}?`)) return;

    try {
      setActionLoading(membershipId);
      setErrorMsg(null);
      await unassignResultUserAction(membershipId);
      setSuccessMsg(`Desvinculado del torneo correctamente.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al desvincular del torneo.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!loading && currentUser && currentUser.role === "USUARIO_DE_RESULTADOS") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Acceso Reservado a Administradores
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            La creación e invitación de Usuarios de Resultados es gestionada exclusivamente por los Administradores de Torneo y Administradores Globales.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/admin/my-matches"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-[#00f0ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Ir a Mis Partidos
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
            <Users className="w-8 h-8 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Usuarios de Resultados
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Crea credenciales y asigna personal para la captura y reporte oficial de marcadores
          </p>
        </div>

        <button
          onClick={() => { setIsCreateModalOpen(true); setErrorMsg(null); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={16} />
          Nuevo Usuario de Resultados
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabla de Usuarios de Resultados */}
      <div className="bg-[#0b1118]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-purple-400">
            Usuarios Registrados ({users.length})
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="text-white/40 hover:text-purple-400 transition-colors p-1.5"
            title="Refrescar lista"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-white/40">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs uppercase tracking-widest">Cargando personal de resultados...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3">
            <Users className="w-8 h-8 text-white/20" />
            <span>No hay usuarios de resultados registrados en tu ámbito todavía.</span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs uppercase tracking-wider hover:bg-purple-500/30 transition-all"
            >
              Registrar Primer Anotador
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-white/40 font-bold uppercase tracking-widest text-[9px] border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Usuario</th>
                  <th className="py-3.5 px-6">Correo</th>
                  <th className="py-3.5 px-6">Torneos Asignados</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => {
                  const isBusy = actionLoading === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 font-semibold text-white/90">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 font-bold">
                            {user.full_name ? user.full_name[0].toUpperCase() : <User size={14} />}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block">{user.full_name || "Sin nombre"}</span>
                            <span className="text-[10px] text-purple-400/80 font-medium">ANOTADOR OFICIAL</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/60 font-mono text-[11px]">
                        {user.email}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {user.memberships.length === 0 ? (
                            <span className="text-[10px] text-white/30 italic">Sin torneo asignado</span>
                          ) : (
                            user.memberships.map((m) => (
                              <span
                                key={m.membershipId}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-white/80 group-hover:border-white/20 transition-all"
                              >
                                <Trophy size={11} className="text-purple-400" />
                                <span>{m.tournamentName}</span>
                                <button
                                  onClick={() => handleUnassignTournament(m.membershipId, user.full_name || user.email, m.tournamentName)}
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
                            onClick={() => { setAssignModalUser(user); setSelectedAssignTournamentId(""); }}
                            className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all uppercase tracking-wider font-bold"
                          >
                            <Link2 size={10} />
                            + Asignar
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {user.is_active ? (
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
                          onClick={() => handleToggleStatus(user)}
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            user.is_active
                              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {isBusy ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : user.is_active ? (
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

      {/* Modal: Crear Usuario de Resultados */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1622] border border-purple-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Nuevo Usuario de Resultados
                  </h3>
                  <span className="text-[10px] text-white/50">Crea las credenciales y asigna un torneo</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4" autoComplete="off">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Daniel Gómez"
                    autoComplete="off"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="anotador@torneo.com"
                    autoComplete="off"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Contraseña Inicial *
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
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Asignar a Torneo Inicial (Opcional)
                </label>
                <div className="relative">
                  <Trophy size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <select
                    value={formTournamentId}
                    onChange={(e) => setFormTournamentId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors appearance-none"
                  >
                    <option value="">-- Sin torneo inicial (asignar después) --</option>
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0e1622] text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === "create" ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Guardar Usuario"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar a Torneo */}
      {assignModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1622] border border-purple-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Link2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Vincular a Torneo
                  </h3>
                  <span className="text-[10px] text-white/50">{assignModalUser.full_name || assignModalUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setAssignModalUser(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignTournament} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Selecciona el Torneo a Asignar
                </label>
                <select
                  required
                  value={selectedAssignTournamentId}
                  onChange={(e) => setSelectedAssignTournamentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 transition-colors"
                >
                  <option value="" disabled>-- Elige un torneo --</option>
                  {tournaments
                    .filter((t) => !assignModalUser.memberships.some((m) => m.tournamentId === t.id))
                    .map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0e1622] text-white">
                        {t.name}
                      </option>
                    ))}
                </select>
                {tournaments.filter((t) => !assignModalUser.memberships.some((m) => m.tournamentId === t.id)).length === 0 && (
                  <p className="text-[11px] text-purple-300 mt-2">
                    Este usuario ya está asignado a todos los torneos disponibles bajo tu gestión.
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssignModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "assign" || !selectedAssignTournamentId}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === "assign" ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    "Confirmar Asignación"
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
