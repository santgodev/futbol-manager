import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TeamForm } from "@/components/admin/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto relative">
      
      {/* ── Back ── */}
      <Link href="/admin/teams" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={14} /> Volver a Equipos
      </Link>
      
      {/* ── Header ── */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic mb-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
          NUEVO EQUIPO
        </h1>
        <p className="text-[#00f0ff]/60 text-xs font-semibold uppercase tracking-widest">
          Registra un nuevo club en la base de datos global
        </p>
      </header>

      <TeamForm />
    </div>
  );
}
