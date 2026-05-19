import { Tables } from "@/types/supabase";

interface TournamentRulesProps {
  rules: Tables<"tournament_rules">[];
}

export const TournamentRules = ({ rules }: TournamentRulesProps) => {
  return (
    <section id="rules" className="py-32 border-b border-brand-navy/30">
      <div className="max-w-4xl mx-auto px-4 md:px-12 text-center">
        <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua mb-6">Reglamento Básico</h3>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand mb-16 hero-title !not-italic">
          NORMAS DEL TORNEO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {rules.map((rule) => (
            <div key={rule.id} className="border-l-2 border-brand-teal pl-6 py-2">
              <h4 className="text-brand-sand font-bold mb-2 uppercase tracking-wide">{rule.title}</h4>
              <p className="text-sm text-brand-aqua/70 leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>

        <button className="mt-16 px-10 py-4 border border-brand-aqua/30 text-brand-sand font-semibold uppercase tracking-[0.3em] text-xs hover:bg-brand-teal hover:border-brand-teal transition-all duration-500">
          Descargar PDF
        </button>
      </div>
    </section>
  );
};
