import React, { Suspense } from "react";
import { ArrowRight, Zap, BarChart3, Shield, Users } from "lucide-react";
import { HomeSearchInput } from "./HomeSearchInput";

const features = [
  { icon: Zap,       label: "Datos en tiempo real" },
  { icon: BarChart3, label: "Estadísticas avanzadas" },
  { icon: Shield,    label: "Plataforma segura" },
  { icon: Users,     label: "Comunidad activa" },
];

const StatBadge = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center px-6 py-4 rounded-2xl bg-[#0a0f14] border border-[#202830]">
    <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
    <span className="text-[11px] text-[#707b86] mt-0.5 font-medium">{label}</span>
  </div>
);

export const HomeHero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#05080b]">

      {/* Subtle radial glow — top center */}
      <div
        className="absolute inset-x-0 top-0 h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(10,132,255,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Very subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#a7b0ba 1px, transparent 1px), linear-gradient(90deg, #a7b0ba 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="flex flex-col gap-8">

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full border border-[#0a84ff]/30 bg-[#0a84ff]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0a84ff] animate-pulse" />
              <span className="text-[11.5px] font-semibold text-[#0a84ff] tracking-wider uppercase">
                Plataforma deportiva
              </span>
            </div>

            {/* Main heading */}
            <div className="flex flex-col gap-4">
              <h1
                className="font-bold text-white leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
              >
                Vive cada torneo.{" "}
                <span className="text-[#0a84ff]">Sigue cada pasión.</span>
              </h1>
              <p className="text-[#a7b0ba] text-[17px] leading-relaxed max-w-[440px]">
                La plataforma definitiva para el seguimiento de torneos deportivos.
                Estadísticas, posiciones y resultados en tiempo real.
              </p>
            </div>

            {/* Search */}
            <Suspense
              fallback={
                <div className="h-12 w-full max-w-md bg-[#0a0f14] animate-pulse rounded-xl border border-[#202830]" />
              }
            >
              <HomeSearchInput />
            </Suspense>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0a0f14] border border-[#202830] text-[#a7b0ba] text-[12.5px] font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-[#0a84ff]" />
                  {label}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <a
                href="#torneos"
                className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-white bg-[#0a84ff] rounded-full hover:bg-[#2493ff] transition-all duration-200 shadow-[0_4px_20px_rgba(10,132,255,0.35)]"
              >
                Ver torneos
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-[#a7b0ba] hover:text-white transition-colors duration-200"
              >
                Crear cuenta gratis
              </a>
            </div>
          </div>

          {/* ── RIGHT: Visual card ── */}
          <div className="relative flex flex-col gap-4 lg:pl-8">

            {/* Main card — keychain product */}
            <div className="relative rounded-3xl border border-[#202830] bg-[#0a0f14] overflow-hidden p-8 flex flex-col items-center gap-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">

              {/* Top bar */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="text-[12px] text-[#707b86] font-medium">Disponible ahora</span>
                </div>
                <span className="text-[11px] text-[#0a84ff] font-semibold uppercase tracking-widest">Nuevo</span>
              </div>

              {/* Llavero image */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(10,132,255,0.2) 0%, transparent 70%)",
                  }}
                />
                <img
                  src="/llavero.png"
                  alt="Llavero Inteligente Pegasight"
                  className="relative z-10 w-40 h-40 object-contain drop-shadow-[0_8px_24px_rgba(10,132,255,0.4)]"
                  style={{
                    animation: "floatY 4s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Product info */}
              <div className="w-full flex flex-col items-center gap-2 text-center">
                <h3 className="font-bold text-white text-[18px] tracking-tight">
                  Llavero Inteligente
                </h3>
                <p className="text-[#707b86] text-[13px] max-w-[240px] leading-relaxed">
                  Tu acceso. Tu identidad. Tu pasión deportiva.
                </p>
              </div>

              {/* Action */}
              <button className="w-full flex items-center justify-center gap-2 py-3 px-6 text-[13px] font-semibold text-white bg-[#0a84ff] rounded-xl hover:bg-[#2493ff] transition-all duration-200 shadow-[0_4px_16px_rgba(10,132,255,0.3)]">
                <span>Adquirir ahora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(10,132,255,0.07), transparent)",
                }}
              />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatBadge value="50+" label="Torneos" />
              <StatBadge value="2K+" label="Partidos" />
              <StatBadge value="8K+" label="Jugadores" />
            </div>
          </div>

        </div>
      </div>

      {/* Float animation */}
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
};
