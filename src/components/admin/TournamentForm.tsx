"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament } from "@/app/admin/actions";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export function TournamentForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [maxTeams, setMaxTeams] = useState(10);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      setErrorMessage("Nombre y ubicación son obligatorios");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      await createTournament({
        name,
        location,
        max_teams: maxTeams,
        description,
        registration_status: 'OPEN'
      });
      setStatus("success");
      setTimeout(() => {
        router.push("/admin/tournaments");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Error al crear torneo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-deep p-8 border border-brand-navy/30 max-w-2xl mx-auto">
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Nombre del Torneo</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Copa Champions 2026"
            className="w-full bg-black border border-brand-navy/50 p-4 text-brand-sand focus:border-brand-teal outline-none transition-all hero-title !not-italic text-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Ubicación / Ciudad</label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Madrid, España"
              className="w-full bg-black border border-brand-navy/50 p-4 text-brand-sand focus:border-brand-teal outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Límite de Equipos</label>
            <input 
              type="number"
              value={maxTeams}
              onChange={(e) => setMaxTeams(parseInt(e.target.value))}
              min="2"
              max="100"
              className="w-full bg-black border border-brand-navy/50 p-4 text-brand-sand focus:border-brand-teal outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Descripción / Reglas Cortas</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el formato del torneo..."
            rows={4}
            className="w-full bg-black border border-brand-navy/50 p-4 text-brand-sand focus:border-brand-teal outline-none transition-all resize-none"
          />
        </div>

        <div className="pt-6 border-t border-brand-navy/30">
          <button 
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-brand-teal text-brand-deep py-4 font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando Torneo...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                ¡Torneo Creado!
              </>
            ) : (
              "Lanzar Torneo"
            )}
          </button>
          
          {status === "error" && (
            <p className="mt-4 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> {errorMessage}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
