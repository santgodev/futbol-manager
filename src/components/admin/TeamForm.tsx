"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/admin/actions";
import { LogoUploader } from "./LogoUploader";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export function TeamForm() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorMessage("El nombre es obligatorio");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      await createTeam(name, logoUrl);
      setStatus("success");
      setTimeout(() => {
        router.push("/admin/teams");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Error al crear equipo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-deep p-8 border border-brand-navy/30 max-w-xl mx-auto">
      <div className="flex flex-col gap-8">
        
        {/* Pipeline de Imagen (Probablemente el Problema 7 que mencionaste) */}
        <div className="flex flex-col items-center gap-4">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Escudo del Equipo</label>
          <LogoUploader 
            onUploadSuccess={(url) => setLogoUrl(url)} 
            defaultImage={logoUrl}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Nombre del Equipo</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Real Madrid, Los Galácticos..."
            className="w-full bg-black border border-brand-navy/50 p-4 text-brand-sand focus:border-brand-teal outline-none transition-all hero-title !not-italic text-xl"
          />
        </div>

        <div className="pt-4 border-t border-brand-navy/30">
          <button 
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-brand-teal text-brand-deep py-4 font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                ¡Equipo Creado!
              </>
            ) : (
              "Guardar Equipo"
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
