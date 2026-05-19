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
        className="w-full max-w-md p-8 md:p-12 bg-brand-navy/10 border border-brand-navy/30 backdrop-blur-xl relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <Shield className="w-12 h-16 text-brand-teal mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter text-brand-sand hero-title !not-italic text-center">
            ACCESO<br/>AUTORIZADO
          </h1>
          <p className="text-[10px] text-brand-aqua/50 uppercase tracking-[0.3em] mt-4 text-center">
            Pegasight Sports Identity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/80 font-bold ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-brand-deep/50 border border-brand-navy/50 focus:border-brand-teal px-4 py-3 text-brand-sand outline-none transition-colors"
              placeholder="admin@torneo.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/80 font-bold ml-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full bg-brand-deep/50 border border-brand-navy/50 focus:border-brand-teal px-4 py-3 text-brand-sand outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 text-center"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal text-brand-deep font-bold uppercase tracking-[0.2em] py-4 mt-4 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Autenticando..." : "Ingresar"}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
