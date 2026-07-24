"use client";

import { useState } from "react";
import { ShieldCheck, Zap, Scissors, Shirt, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function PromoUniforms() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const phone = formData.get("phone")?.toString();
    const email = formData.get("email")?.toString();
    const team_name = formData.get("teamName")?.toString();

    if (!name || !phone || !email || !team_name) {
      setError("Todos los campos son requeridos.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { error: dbError } = await supabase.from("uniform_leads").insert([
      { name, phone, email, team_name }
    ]);

    setIsSubmitting(false);

    if (dbError) {
      console.error("Error al guardar lead:", dbError);
      setError("Hubo un error al guardar tu información. Por favor, intenta de nuevo.");
    } else {
      setIsSuccess(true);
      e.currentTarget.reset();
    }
  };

  return (
    <div className="relative w-full bg-[#04080f] min-h-screen pt-24 pb-24 overflow-hidden selection:bg-[#0088ff] selection:text-white font-sans">
      
      {/* Base gradient & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "linear-gradient(160deg, #020408 0%, #04080f 55%, #060c18 100%)", zIndex: 0 }} />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(circle at 50% 30%, rgba(0, 150, 255, 0.15) 0%, transparent 60%)", zIndex: 0 }} />

      {/* Cyberpunk Grid Floor */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none h-full lg:h-[70%] z-0">
        <div className="absolute inset-0 opacity-40"
             style={{
               backgroundImage: "linear-gradient(to top, rgba(0, 136, 255, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0, 136, 255, 0.1) 1px, transparent 1px)",
               backgroundSize: "50px 50px",
               transform: "perspective(500px) rotateX(60deg) scale(2.5)",
               transformOrigin: "top center",
               maskImage: "linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)",
               WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 50%, transparent 100%)",
             }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="font-bold italic uppercase select-none leading-tight mb-6"
              style={{ fontSize: "clamp(32px, 8vw, 64px)" }}>
            <span className="block text-white">
              VISTE A TU <span className="text-[#0088ff] drop-shadow-[0_0_15px_rgba(0,136,255,0.5)]">EQUIPO.</span>
            </span>
            <span className="block text-white">
              DOMINA LA <span className="text-[#0088ff] drop-shadow-[0_0_15px_rgba(0,136,255,0.5)]">CANCHA.</span>
            </span>
          </h1>
          <p className="text-brand-text-muted text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Indumentaria deportiva de alto rendimiento. Diseño 100% personalizado y tecnología de última generación para llevar tu identidad al siguiente nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FEATURES PANEL (Glassmorphism) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Feature 1 */}
            <div className="panel-premium group hover:border-[#0088ff]/60 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#0088ff]/10 border border-[#0088ff]/30 flex items-center justify-center mb-6 group-hover:shadow-[0_0_15px_rgba(0,136,255,0.4)] transition-all">
                <Zap className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 italic uppercase">Rendimiento Técnico</h3>
              <p className="text-brand-text-muted text-sm font-light">
                Telas transpirables con evaporación rápida. Mantén a tu equipo fresco durante los 90 minutos de juego.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="panel-premium group hover:border-[#0088ff]/60 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#0088ff]/10 border border-[#0088ff]/30 flex items-center justify-center mb-6 group-hover:shadow-[0_0_15px_rgba(0,136,255,0.4)] transition-all">
                <ShieldCheck className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 italic uppercase">Durabilidad Premium</h3>
              <p className="text-brand-text-muted text-sm font-light">
                Sublimación de alta calidad que resiste la fricción, tirones y múltiples lavados sin perder el color.
              </p>
            </div>

            {/* Feature 3 (Full width) */}
            <div className="sm:col-span-2 panel-premium-highlight relative overflow-hidden group">
              {/* Glowing Background effect */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#0088ff]/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#0055cc] to-[#00f0ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                  <Shirt className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 italic uppercase">Diseño 100% Personalizado</h3>
                  <p className="text-brand-text-muted text-sm font-light mb-4">
                    Desde el escudo hasta el tipo de cuello. Nuestros diseñadores crearán un modelo único en 3D antes de la fabricación para que sea perfecto.
                  </p>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-[#00f0ff]"><CheckCircle2 className="w-3.5 h-3.5" /> Render 3D</span>
                    <span className="flex items-center gap-1.5 text-xs text-[#00f0ff]"><CheckCircle2 className="w-3.5 h-3.5" /> Todas las tallas</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* FORM PANEL (Glassmorphism & Cyberpunk) */}
          <div className="lg:col-span-5 relative">
            {/* Ambient glow behind form */}
            <div className="absolute inset-0 bg-[#0055ff] rounded-[30px] blur-[40px] opacity-20 pointer-events-none"></div>
            
            <div className="relative bg-[#030b17]/80 backdrop-blur-xl border border-[#0088ff]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,136,255,0.1),inset_0_0_40px_rgba(0,136,255,0.05)]">
              {/* Glowing right edge border decorative */}
              <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#00ccff] to-transparent shadow-[0_0_15px_2px_#0088ff] opacity-70 rounded-r-3xl pointer-events-none"></div>

              <h3 className="text-xl font-bold text-white mb-2 italic uppercase tracking-wide">
                Solicita tu <span className="text-[#00f0ff]">Cotización</span>
              </h3>
              <p className="text-brand-text-muted text-sm font-light mb-8">
                Déjanos tus datos y nos pondremos en contacto contigo para enviarte el catálogo completo y precios.
              </p>

              {isSuccess ? (
                <div className="bg-[#0088ff]/10 border border-[#0088ff]/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#00f0ff]/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                    <CheckCircle2 className="w-8 h-8 text-[#00f0ff]" />
                  </div>
                  <h4 className="text-lg font-bold text-white italic uppercase">¡Solicitud Exitosa!</h4>
                  <p className="text-brand-text-muted text-sm">
                    Pronto un asesor se comunicará contigo vía WhatsApp o Correo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted">Nombre Completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full bg-[#0a1122] border border-[#0088ff]/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all text-sm font-medium shadow-inner"
                      placeholder="Ej. Carlos Rodríguez"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="teamName" className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted">Nombre del Equipo</label>
                    <input
                      type="text"
                      id="teamName"
                      name="teamName"
                      required
                      className="w-full bg-[#0a1122] border border-[#0088ff]/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all text-sm font-medium shadow-inner"
                      placeholder="Ej. Real Bogotá"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted">WhatsApp</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full bg-[#0a1122] border border-[#0088ff]/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all text-sm font-medium shadow-inner"
                        placeholder="+57 300..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted">Correo</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full bg-[#0a1122] border border-[#0088ff]/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all text-sm font-medium shadow-inner"
                        placeholder="tu@correo.com"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-cta-primary w-full group"
                    >
                      <span>{isSubmitting ? "PROCESANDO..." : "ENVIAR SOLICITUD"}</span>
                      {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
