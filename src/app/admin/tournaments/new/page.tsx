"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TournamentForm } from "@/components/admin/TournamentForm";

export default function NewTournamentPage() {
  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto relative">

      {/* Back button */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={16} /> Volver al Dashboard
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tighter text-white hero-title !not-italic mb-2 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          NUEVO TORNEO
        </h1>
        <p className="text-[#00f0ff]/60 text-xs font-semibold uppercase tracking-widest">
          Configuración inicial de la liga
        </p>
      </header>

      <TournamentForm />
    </div>
  );
}
