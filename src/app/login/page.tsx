"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "@/components/ui/Shield";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await login(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-deep text-brand-sand font-sans selection:bg-brand-teal selection:text-white flex items-center justify-center relative overflow-hidden">
      
      {/* Cinematic Grain Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-8 md:p-12 bg-[#040c1a]/80 border border-[#0066cc]/30 backdrop-blur-xl relative z-10 rounded-2xl shadow-[0_0_50px_rgba(0,100,255,0.1)]"
      >
        <div className="flex flex-col items-center mb-10">
          <Shield className="w-12 h-16 text-[#00f0ff] mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          <h1 className="text-3xl font-bold tracking-tighter text-white hero-title !not-italic text-center leading-tight">
            ACCESO<br/>AUTORIZADO
          </h1>
          <p className="text-[10px] text-[#00f0ff]/70 uppercase tracking-[0.3em] mt-3 text-center">
            Pegasight Sports Identity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/90 font-bold ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-[#02060d]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] px-4 py-3 text-white rounded-lg outline-none transition-all"
              placeholder="admin@torneo.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/90 font-bold ml-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full bg-[#02060d]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] px-4 py-3 text-white rounded-lg outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 text-center rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white font-bold uppercase tracking-[0.2em] py-3.5 rounded-lg hover:shadow-[0_0_20px_rgba(0,170,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Autenticando..." : "Ingresar"}
            </button>
            
            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full bg-transparent border border-[#0055cc]/50 text-white/70 font-bold uppercase tracking-[0.2em] py-3.5 rounded-lg hover:bg-[#0055cc]/20 hover:text-white transition-all text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
