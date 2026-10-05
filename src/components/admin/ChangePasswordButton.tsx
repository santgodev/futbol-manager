"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, Loader2, X, AlertCircle, CheckCircle2, ShieldAlert, Wand2 } from "lucide-react";
import { forceChangeUserPasswordAction } from "@/app/admin/server-actions";

interface ChangePasswordButtonProps {
  userId: string;
  userName: string | null;
  userEmail: string;
}

export function ChangePasswordButton({ userId, userName, userEmail }: ChangePasswordButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Validation rules
  const isValidLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  
  const isFormValid = isValidLength && hasUppercase && hasNumber;

  const generateSecurePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    let pass = "";
    // Asegurar 1 de cada tipo
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Rellenar hasta 10 caracteres
    const all = chars + uppers + numbers + symbols;
    for (let i = 0; i < 7; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    
    // Mezclar
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setNewPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg("La contraseña no cumple con los requisitos mínimos.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await forceChangeUserPasswordAction(userId, newPassword);
      setSuccessMsg("¡Contraseña actualizada exitosamente!");
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg(null);
        setNewPassword("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400/80 hover:text-amber-300 transition-colors"
        title="Cambiar Contraseña"
      >
        <KeyRound size={14} className="hover:scale-110 transition-transform" />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1118]/95 border border-amber-500/30 rounded-3xl w-full max-w-md shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[150px] bg-amber-500/20 blur-[80px] pointer-events-none" />
            
            <div className="p-6 sm:p-8 relative z-10 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0">
                    <ShieldAlert size={22} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-widest drop-shadow-md">
                      Cambiar Contraseña
                    </h2>
                    <p className="text-[11px] text-amber-400/80 font-medium truncate max-w-[200px]" title={userName || userEmail}>
                      {userName || userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="text-white/40 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] sm:text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                      Nueva Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="inline-flex items-center gap-1.5 text-[9px] font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors"
                    >
                      <Wand2 size={10} />
                      Generar Segura
                    </button>
                  </div>
                  <div className="relative group">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Escribe o genera una contraseña..."
                      required
                      disabled={loading || !!successMsg}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Rules UI */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
                    Requisitos de Seguridad:
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 text-[11px] font-semibold transition-colors ${isValidLength ? "text-emerald-400" : "text-white/40"}`}>
                      {isValidLength ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] font-semibold transition-colors ${hasUppercase ? "text-emerald-400" : "text-white/40"}`}>
                      {hasUppercase ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                      Al menos 1 letra mayúscula
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] font-semibold transition-colors ${hasNumber ? "text-emerald-400" : "text-white/40"}`}>
                      {hasNumber ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                      Al menos 1 número
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="w-1/3 py-3 text-[11px] sm:text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl uppercase tracking-widest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormValid || !!successMsg}
                    className="flex-1 py-3 text-[11px] sm:text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Aplicar Cambio Seguro"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
