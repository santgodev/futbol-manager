import { BarChart3, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Tiempo real",
    desc: "Datos actualizados al instante",
  },
  {
    icon: BarChart3,
    title: "Estadísticas",
    desc: "Análisis completo de cada partido",
  },
  {
    icon: ShieldCheck,
    title: "Seguro",
    desc: "Tu información siempre protegida",
  },
];

export const HomeFooter = () => {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
      <div className="rounded-2xl border border-[#202830] bg-[#0a0f14] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">

          {/* Features — left */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#202830]">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <div className="w-9 h-9 rounded-xl bg-[#0a84ff]/10 border border-[#0a84ff]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#0a84ff]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-[11.5px] text-[#707b86] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA — right */}
          <div className="md:col-span-4 flex items-center gap-4 px-6 py-5 border-t md:border-t-0 md:border-l border-[#202830] bg-[#0a84ff]/5">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <p className="text-[10.5px] font-bold text-[#0a84ff] uppercase tracking-widest">
                Únete gratis
              </p>
              <h4 className="text-[13px] font-bold text-white">
                La comunidad de torneos más grande
              </h4>
            </div>
            <Link
              href="/login"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-[12.5px] font-semibold text-white bg-[#0a84ff] rounded-full hover:bg-[#2493ff] transition-all shadow-[0_2px_12px_rgba(10,132,255,0.3)] whitespace-nowrap"
            >
              Empezar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
