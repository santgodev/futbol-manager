import { Tables } from "@/types/supabase";

interface TournamentRulesProps {
  rules: Tables<"tournament_rules">[];
}

export const TournamentRules = ({ rules }: TournamentRulesProps) => {
  if (!rules || rules.length === 0) return null;

  return (
    <section id="rules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-12 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Reglamento Oficial
          </h2>
        </div>
        <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest">
          Normativa & Código de Conducta
        </span>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-panel p-6 hover:border-brand-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.01)] transition-all duration-300 flex flex-col">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_6px_#00f0ff]" />
                {rule.title}
              </h4>
              <p className="text-brand-text-muted text-[11px] font-light leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>

        <button className="mt-12 neon-button-outline shadow-[0_2px_8px_rgba(0,85,204,0.1)] hover:shadow-[0_4px_15px_rgba(0,136,255,0.2)]">
          Descargar PDF Completo
        </button>
      </div>
    </section>
  );
};
