import Link from "next/link";
import { TeamForm } from "@/components/admin/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto">
      <Link href="/admin/teams" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver a Equipos
      </Link>
      
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
          NUEVO EQUIPO
        </h1>
        <p className="text-brand-aqua/60 text-xs uppercase tracking-widest">
          Registra un nuevo club en la base de datos global
        </p>
      </header>

      <TeamForm />
    </div>
  );
}
