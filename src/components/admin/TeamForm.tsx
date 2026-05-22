"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function TeamForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      primary_color: formData.get("primary_color") as string,
      logo_url: (formData.get("logo_url") as string) || null,
    };

    if (!data.name) {
      setErrorMessage("El nombre del equipo es obligatorio");
      setStatus("error");
      return;
    }

    try {
      const res = await createTeam(data);
      if (res.success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/admin/teams");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Error al crear equipo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel-premium max-w-xl mx-auto">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-teal via-brand-aqua to-brand-gold" />
      
      <div className="flex flex-col gap-6 relative z-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand">Registrar Nuevo Equipo</h3>
        
        {/* Nombre del Equipo */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Nombre del Equipo *</label>
          <input 
            type="text" 
            name="name" 
            required 
            className="input-premium" 
            placeholder="Ej. Real Madrid, Los Galácticos..." 
          />
        </div>

        {/* Ciudad Base */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Ciudad Base</label>
          <input 
            type="text" 
            name="city" 
            className="input-premium" 
            placeholder="Ej. Madrid, España" 
          />
        </div>

        {/* Color Principal */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold ml-1">Color Principal</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              name="primary_color" 
              defaultValue="#447E8C"
              className="w-12 h-12 bg-black border border-brand-navy/50 rounded cursor-pointer p-1"
            />
            <span className="text-[10px] uppercase tracking-widest text-brand-aqua/40">
              Se usará para personalizar la visualización del equipo
            </span>
          </div>
        </div>

        {/* Escudo */}
        <ImageUpload
          name="logo_url"
          label="Escudo del Equipo (Opcional)"
          bucket="logos"
          folder="teams"
        />

        {/* Mensaje de Error */}
        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-lg flex items-center gap-2">
            <AlertTriangle size={14} /> {errorMessage}
          </div>
        )}

        {/* Mensaje de Éxito */}
        {status === "success" && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-lg flex items-center gap-2">
            <Shield size={14} /> Equipo creado correctamente. Redirigiendo...
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-brand-navy/30">
          <Link 
            href="/admin/teams" 
            className="text-[10px] text-brand-aqua/60 hover:text-brand-sand uppercase tracking-widest font-bold px-4 py-2 transition-colors"
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="btn-premium-teal min-w-[160px]"
          >
            {status === "submitting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield size={16} />
            )}
            {status === "submitting" ? "Creando..." : "Registrar Equipo"}
          </button>
        </div>

      </div>
    </form>
  );
}
