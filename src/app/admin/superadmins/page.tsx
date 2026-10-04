"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, UserPlus, UserX, UserCheck, AlertTriangle, Shield, CheckCircle2, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { getSuperadminsAction, createSuperadminAction, toggleUserStatusAction, getCurrentUserProfile } from "../pegasight-actions";

export default function SuperadminsPage() {
  const [superadmins, setSuperadmins] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const profile = await getCurrentUserProfile();
      setCurrentUser(profile);

      if (profile?.role === "ADMINISTRADOR_GENERAL") {
        const admins = await getSuperadminsAction();
        setSuperadmins(admins);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar superadministradores");
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
      await createSuperadminAction({
        email: formEmail,
        password: formPassword,
        full_name: formName
      });
      setSuccessMsg(`Superadministrador ${formName} creado correctamente.`);
      setIsModalOpen(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user: any) => {
    if (user.id === currentUser?.id && user.is_active) {
      setErrorMsg("No puedes desactivar tu propia cuenta de Superadministrador.");
      return;
    }

    try {
      setActionLoading(user.id);
      setErrorMsg(null);
      await toggleUserStatusAction(user.id, user.is_active);
      setSuccessMsg(`Estado de ${user.full_name || user.email} actualizado.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!loading && currentUser && currentUser.role !== "ADMINISTRADOR_GENERAL") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 pt-12">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Acceso Reservado al Administrador General
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            Como Superadministrador, la lista de otros superadministradores no está disponible. Tu rol te permite administrar torneos y crear las credenciales de los <span className="text-[#00f0ff] font-semibold">Administradores de Torneo</span> y <span className="text-purple-400 font-semibold">Usuarios de Resultados</span> bajo tu cargo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin/tournament-admins"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:scale-[1.02] transition-all"
            >
              <Users size={16} />
              Gestionar Admins de Torneo
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white font-extrabold text-xs tracking-wider uppercase hover:bg-white/10 transition-all"
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
            <ShieldCheck className="w-8 h-8 text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Superadministradores
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Panel exclusivo del Administrador General para gestionar cuentas con acceso global
          </p>
        </div>

        <button
          onClick={() => { setIsModalOpen(true); setErrorMsg(null); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={16} />
          Nuevo Superadministrador
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

      {/* Superadmins List */}
      <div className="bg-[#0b1118]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#00f0ff]/70">
            Cuentas Globales ({superadmins.length})
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="text-white/40 hover:text-[#00f0ff] transition-colors p-1.5"
            title="Refrescar lista"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-white/40">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00f0ff]" />
            <span className="text-xs uppercase tracking-widest">Cargando superadministradores...</span>
          </div>
        ) : superadmins.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs uppercase tracking-widest">
            No se encontraron superadministradores registrados.
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-white/40 font-bold uppercase tracking-widest text-[9px] border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Nombre</th>
                  <th className="py-3.5 px-6">Correo Electrónico</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6">Fecha Registro</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {superadmins.map((admin) => {
                  const isCurrent = admin.id === currentUser?.id;
                  const isBusy = actionLoading === admin.id;

                  return (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 font-semibold text-white/90">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-[#00f0ff]" />
                          <span>{admin.full_name || "Sin nombre"}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 px-1.5 py-0.5 rounded font-bold">
                              TÚ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/60 font-mono text-[11px]">
                        {admin.email}
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
                      <td className="py-4 px-6 text-white/40 text-[11px]">
                        {new Date(admin.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          disabled={isBusy || (isCurrent && admin.is_active)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            admin.is_active
                              ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                          title={isCurrent ? "No puedes desactivarte a ti mismo" : ""}
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

      {/* Modal: Nuevo Superadministrador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0f16] border border-[#00f0ff]/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00f0ff]" />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
                  Nuevo Superadministrador
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]/70 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Carlos Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]/70 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="admin@pegasight.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]/70 mb-1.5">
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "create"}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {actionLoading === "create" ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Guardar Superadmin"
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
