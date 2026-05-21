import { BarChart3, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const HomeFooter = () => {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-10">
      <div
        className="rounded-xl border border-white/[0.06] bg-brand-navy/40 backdrop-blur-sm
                    grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]"
      >
        {/* Feature 1 */}
        <FeatureItem
          icon={<BarChart3 size={22} className="text-brand-text-muted" />}
          title="Estadísticas en tiempo real"
          desc="Datos actualizados al instante"
          className="md:col-span-3"
        />

        {/* Feature 2 */}
        <FeatureItem
          icon={<Mail size={22} className="text-brand-text-muted" />}
          title="Cobertura completa"
          desc="Todos los torneos, todos los detalles"
          className="md:col-span-3"
        />

        {/* Feature 3 */}
        <FeatureItem
          icon={<ShieldCheck size={22} className="text-brand-text-muted" />}
          title="Seguro y confiable"
          desc="Tu información siempre protegida"
          className="md:col-span-3"
        />

        {/* CTA Banner */}
        <div
          className="md:col-span-3 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4
                     bg-gradient-to-r from-brand-blue/20 to-brand-blue/5"
        >
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-brand-cyan font-bold mb-0.5">
              Únete a la comunidad
            </p>
            <h4 className="text-sm font-bold text-white leading-snug">
              PEGASIGHT
            </h4>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              Donde cada partido cuenta y cada afición importa.
            </p>
          </div>
          <Link
            href="/login"
            className="neon-button-solid whitespace-nowrap text-[11px] px-4 py-2 shrink-0"
          >
            Regístrate gratis
          </Link>
        </div>
      </div>
    </footer>
  );
};

function FeatureItem({
  icon,
  title,
  desc,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-4 px-6 py-5 ${className}`}>
      <div
        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0
                   hover:border-brand-cyan/40 hover:shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-all"
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-white leading-snug">{title}</span>
        <span className="text-[10px] text-brand-text-muted">{desc}</span>
      </div>
    </div>
  );
}
