"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  UserPlus, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Link2, 
  Trash2, 
  X,
  Mail,
  User,
  Lock,
  ChevronDown
} from "lucide-react";
import { 
  getTournamentMembersAction, 
  getTournamentAdminsAction,
  assignTournamentAdminAction, 
  toggleMembershipStatusAction,
  unassignTournamentAdminAction
} from "@/app/admin/pegasight-actions";

interface TournamentAdminManagerProps {
  tournamentId: string;
}

export function TournamentAdminManager({ tournamentId }: TournamentAdminManagerProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [allPlatformAdmins, setAllPlatformAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"link_existing" | "create_new">("link_existing");
  const [selectedAdminEmail, setSelectedAdminEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [membersData, platformAdmins] = await Promise.all([
        getTournamentMembersAction(tournamentId),
        getTournamentAdminsAction()
      ]);

      const admins = (membersData || []).filter((m: any) => m.role === "ADMINISTRADOR_DEL_TORNEO");
      setMembers(admins);
      setAllPlatformAdmins(platformAdmins || []);
    } catch (err: any) {
      console.error("Error al cargar administradores:", err);
      setErrorMsg(err.message || "Error al cargar la lista de administradores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      loadData();
    }
  }, [tournamentId]);

  // Filtrar administradores ya asignados para el dropdown
  const assignedEmails = new Set(
    members.map((m) => (m.user?.email || "").toLowerCase().trim())
  );
  const availableAdminsToLink = allPlatformAdmins.filter(
    (adm) => !assignedEmails.has(adm.email.toLowerCase().trim()) && adm.is_active
  );

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminEmail) {
      setErrorMsg("Por favor, selecciona un administrador de la lista.");
      return;
    }

    try {
      setActionLoading("link_existing");
      setErrorMsg(null);
      await assignTournamentAdminAction({
        tournamentId,
        email: selectedAdminEmail
      });

      setSuccessMsg(`Administrador ${selectedAdminEmail} vinculado exitosamente a este torneo.`);
      setSelectedAdminEmail("");
      setIsFormOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al vincular el administrador.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newFullName.trim() || !newPassword.trim()) {
      setErrorMsg("Todos los campos (correo, nombre completo y contraseña) son obligatorios.");
      return;
    }

    try {
      setActionLoading("create_new");
      setErrorMsg(null);
      await assignTournamentAdminAction({
        tournamentId,
        email: newEmail.trim(),
        full_name: newFullName.trim(),
        password: newPassword
      });

      setSuccessMsg(`Nuevo administrador ${newEmail} creado y vinculado a este torneo.`);
      setNewEmail("");
      setNewFullName("");
      setNewPassword("");
      setIsFormOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear y vincular el nuevo administrador.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (m: any) => {
    try {
      setActionLoading(`toggle-${m.id}`);
      setErrorMsg(null);
      await toggleMembershipStatusAction(m.id, m.status);
      setSuccessMsg("Estado de asignación actualizado correctamente.");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cambiar estado.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassign = async (m: any) => {
    const adminName = m.user?.full_name || m.user?.email || "este administrador";
    if (!confirm(`¿Estás seguro de que deseas desvincular a ${adminName} de este torneo?`)) {
      return;
    }

    try {
      setActionLoading(`unassign-${m.id}`);
      setErrorMsg(null);
      await unassignTournamentAdminAction(m.id);
      setSuccessMsg(`${adminName} ha sido desvinculado de este torneo.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al desvincular administrador.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior de control y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-white/60 leading-relaxed">
            Asigna administradores con acceso exclusivo para gestionar categorías, partidos y resultados de este torneo.
          </p>
          <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
            {members.length} {members.length === 1 ? "Administrador Asignado" : "Administradores Asignados"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Refrescar lista"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-amber-400" : ""} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg ${
              isFormOpen
                ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                : "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] active:scale-95"
            }`}
          >
            {isFormOpen ? (
              <>
                <X size={15} />
                Cerrar Formulario
              </>
            ) : (
              <>
                <UserPlus size={15} />
                Vincular Administrador
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas de error y éxito */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X size={14} />
          </button>
        </div>
      )}

      {/* PANEL EXPANDIBLE: Formulario para vincular o crear administrador */}
      {isFormOpen && (
        <div className="rounded-2xl border border-amber-400/30 bg-[#070e17]/95 p-5 md:p-6 shadow-[0_0_30px_rgba(251,191,36,0.1)] backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Vincular Administrador al Torneo
                </h3>
                <p className="text-[11px] text-white/50">
                  Selecciona un administrador existente o registra credenciales nuevas
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(false)}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Selector de pestañas */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => { setActiveTab("link_existing"); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "link_existing"
                  ? "bg-amber-400 text-black shadow-md font-extrabold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Link2 size={14} />
              Vincular Existente
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("create_new"); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "create_new"
                  ? "bg-amber-400 text-black shadow-md font-extrabold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <UserPlus size={14} />
              Crear Nuevo Admin
            </button>
          </div>

          {/* CONTENIDO PESTAÑA 1: VINCULAR EXISTENTE */}
          {activeTab === "link_existing" && (
            <form onSubmit={handleLinkExisting} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
                  Seleccionar Administrador Registrado
                </label>
                
                {availableAdminsToLink.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedAdminEmail}
                      onChange={(e) => setSelectedAdminEmail(e.target.value)}
                      required
                      className="w-full appearance-none px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 pr-10"
                    >
                      <option value="" disabled className="bg-[#0b1118] text-white/40">
                        -- Elige un Administrador de la lista ({availableAdminsToLink.length} disponibles) --
                      </option>
                      {availableAdminsToLink.map((adm) => {
                        const displayName = adm.full_name ? `${adm.full_name} (${adm.email})` : adm.email;
                        const torneyCount = adm.tournament_memberships?.length || 0;
                        return (
                          <option key={adm.id} value={adm.email} className="bg-[#0b1118] text-white">
                            {displayName} — {torneyCount} {torneyCount === 1 ? "torneo" : "torneos"} gestionados
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-white/15 bg-white/5 text-center text-white/50 text-xs">
                    No hay administradores disponibles por vincular (todos los registrados ya están asignados a este torneo o no existen).
                    <button
                      type="button"
                      onClick={() => setActiveTab("create_new")}
                      className="block mx-auto mt-2 text-amber-400 hover:text-amber-300 font-bold underline"
                    >
                      Crear un nuevo Administrador de Torneo aquí
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-white/40 mt-2">
                  Al vincularlo, este administrador podrá ingresar al panel y gestionar todos los aspectos de este torneo.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "link_existing" || !selectedAdminEmail || availableAdminsToLink.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === "link_existing" ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Vinculando...
                    </>
                  ) : (
                    <>
                      <Link2 size={14} />
                      Vincular a este Torneo
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* CONTENIDO PESTAÑA 2: CREAR NUEVO ADMIN */}
          {activeTab === "create_new" && (
            <form onSubmit={handleCreateNew} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admintorneo@ejemplo.com"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                  />
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ej: Marcos Ramírez"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                  />
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5">
                  Contraseña Inicial *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                  />
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
                <span className="text-[10px] text-white/40 block mt-1">
                  Se creará su cuenta en la plataforma y se le vinculará automáticamente a este torneo.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "create_new" || !newEmail.trim() || !newFullName.trim() || !newPassword.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === "create_new" ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Crear y Vincular
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* LISTADO DE ADMINISTRADORES ASIGNADOS */}
      <div>
        {loading ? (
          <div className="p-8 text-center text-white/40 text-xs uppercase tracking-widest flex items-center justify-center gap-3">
            <RefreshCw size={16} className="animate-spin text-amber-400" />
            Cargando administradores del torneo...
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-white/30">
              <ShieldCheck size={28} />
            </div>
            <div className="max-w-md">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1">
                Sin Administradores Asignados
              </span>
              <p className="text-[11px] text-white/40">
                Este torneo no tiene administradores específicos vinculados. Actualmente solo tú y los Superadministradores pueden gestionarlo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setIsFormOpen(true); setErrorMsg(null); }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-amber-400/25 transition-all"
            >
              <UserPlus size={14} />
              Vincular Primer Administrador
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {members.map((m) => {
              const isActive = m.status === "ACTIVE";
              const isToggleBusy = actionLoading === `toggle-${m.id}`;
              const isUnassignBusy = actionLoading === `unassign-${m.id}`;
              const isBusy = isToggleBusy || isUnassignBusy;

              return (
                <div
                  key={m.id}
                  className="bg-[#0b1118]/80 border border-white/10 hover:border-amber-400/30 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 backdrop-blur-sm group"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                      {m.user?.full_name ? m.user.full_name[0].toUpperCase() : <User size={16} />}
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-amber-300 transition-colors">
                        {m.user?.full_name || "Sin nombre asignado"}
                      </span>
                      <span className="text-[11px] text-white/60 font-mono block truncate">
                        {m.user?.email}
                      </span>
                      <span className="text-[9px] text-white/30 block mt-0.5">
                        Vinculado: {new Date(m.assigned_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge de estado */}
                    {isActive ? (
                      <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Activo
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Inactivo
                      </span>
                    )}

                    {/* Botón Activar / Desactivar */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      disabled={isBusy}
                      className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title={isActive ? "Desactivar acceso" : "Reactivar acceso"}
                    >
                      {isToggleBusy ? (
                        <RefreshCw size={14} className="animate-spin text-amber-400" />
                      ) : isActive ? (
                        <UserX size={14} className="text-red-400 hover:scale-110 transition-transform" />
                      ) : (
                        <UserCheck size={14} className="text-emerald-400 hover:scale-110 transition-transform" />
                      )}
                    </button>

                    {/* Botón Desvincular de este torneo */}
                    <button
                      type="button"
                      onClick={() => handleUnassign(m)}
                      disabled={isBusy}
                      className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400/80 hover:text-red-300 transition-colors"
                      title="Desvincular de este torneo"
                    >
                      {isUnassignBusy ? (
                        <RefreshCw size={14} className="animate-spin text-red-400" />
                      ) : (
                        <Trash2 size={14} className="hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
