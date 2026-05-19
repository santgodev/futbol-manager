import Link from "next/link";
import { TournamentForm } from "@/components/admin/TournamentForm";

export default function NewTournamentPage() {
  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto">
      <Link href="/admin/tournaments" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver a Torneos
      </Link>
      
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
          NUEVA COMPETICIÓN
        </h1>
        <p className="text-brand-aqua/60 text-xs uppercase tracking-widest">
          Configura los parámetros iniciales de tu torneo
        </p>
      </header>

      <TournamentForm />
    </div>
  );
}
