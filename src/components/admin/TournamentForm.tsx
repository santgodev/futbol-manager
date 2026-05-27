"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament } from "@/app/admin/actions";
import { Loader2, CheckCircle2, AlertTriangle, Trophy, Layers, Shield, Calendar } from "lucide-react";

export function TournamentForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [maxTeams, setMaxTeams] = useState(10);
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"GROUPS_AND_PLAYOFFS" | "LEAGUE" | "PLAYOFFS">("GROUPS_AND_PLAYOFFS");
  const [isDoubleRound, setIsDoubleRound] = useState(false);
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
        format,
        is_double_round: format === "PLAYOFFS" ? false : isDoubleRound,
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
    <form onSubmit={handleSubmit} className="panel-premium max-w-2xl mx-auto">
      <div className="flex flex-col gap-6">
        
        {/* Nombre */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Nombre del Torneo</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Copa Champions 2026"
            className="input-premium hero-title !not-italic text-xl !p-4"
          />
        </div>

        {/* Formato del Torneo */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Formato de Competición</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* GROUPS_AND_PLAYOFFS */}
            <button
              type="button"
              onClick={() => setFormat("GROUPS_AND_PLAYOFFS")}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                format === "GROUPS_AND_PLAYOFFS"
                  ? "bg-[#00f0ff]/5 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                  : "bg-[#02060d] border-[#0055cc]/30 hover:border-[#0055cc]/60 hover:bg-[#0055cc]/5"
              }`}
            >
              <div className={`p-2 rounded-lg w-fit ${format === "GROUPS_AND_PLAYOFFS" ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "bg-white/5 text-white/50"}`}>
                <Layers size={18} />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mt-3">Grupos + Playoffs</h3>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
                Fase de grupos todos-contra-todos y eliminatorias finales (semis, final).
              </p>
              {format === "GROUPS_AND_PLAYOFFS" && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              )}
            </button>

            {/* LEAGUE */}
            <button
              type="button"
              onClick={() => setFormat("LEAGUE")}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                format === "LEAGUE"
                  ? "bg-[#00f0ff]/5 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                  : "bg-[#02060d] border-[#0055cc]/30 hover:border-[#0055cc]/60 hover:bg-[#0055cc]/5"
              }`}
            >
              <div className={`p-2 rounded-lg w-fit ${format === "LEAGUE" ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "bg-white/5 text-white/50"}`}>
                <Trophy size={18} />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mt-3">Liga Directa</h3>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
                Todos contra todos simple. El líder con más puntos se corona campeón.
              </p>
              {format === "LEAGUE" && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              )}
            </button>

            {/* PLAYOFFS */}
            <button
              type="button"
              onClick={() => setFormat("PLAYOFFS")}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                format === "PLAYOFFS"
                  ? "bg-[#00f0ff]/5 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                  : "bg-[#02060d] border-[#0055cc]/30 hover:border-[#0055cc]/60 hover:bg-[#0055cc]/5"
              }`}
            >
              <div className={`p-2 rounded-lg w-fit ${format === "PLAYOFFS" ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "bg-white/5 text-white/50"}`}>
                <Shield size={18} />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mt-3">Copa Directa</h3>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
                Eliminación directa (playoffs) desde el inicio. Sin fase de grupos.
              </p>
              {format === "PLAYOFFS" && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              )}
            </button>
          </div>
        </div>

        {/* Doble Vuelta (Solo para Grupos/Liga) */}
        {format !== "PLAYOFFS" && (
          <div className="bg-[#02060d] border border-[#0055cc]/20 rounded-xl p-4 flex items-center justify-between transition-all hover:border-[#0055cc]/40">
            <div className="flex flex-col gap-0.5">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Permitir Ida y Vuelta</span>
              <span className="text-[10px] text-white/40">Los equipos jugarán dos veces entre sí (como local y visitante).</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDoubleRound(!isDoubleRound)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                isDoubleRound ? "bg-[#00f0ff]" : "bg-white/10"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-[#02060d] transition-all ${
                isDoubleRound ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ubicación */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Ubicación / Ciudad</label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Madrid, España"
              className="input-premium !p-4"
            />
          </div>
          {/* Límite Equipos */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Límite de Equipos</label>
            <input 
              type="number"
              value={maxTeams}
              onChange={(e) => setMaxTeams(parseInt(e.target.value))}
              min="2"
              max="100"
              className="input-premium !p-4"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Descripción / Reglas Cortas</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el formato del torneo..."
            rows={3}
            className="input-premium !p-4 resize-none"
          />
        </div>

        {/* Botón de Envío */}
        <div className="pt-6 border-t border-brand-navy/30">
          <button 
            type="submit"
            disabled={status === "submitting"}
            className="btn-premium-teal w-full !py-4"
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
