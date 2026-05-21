"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full bg-[#040c1a]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] px-4 py-3.5 text-white rounded-lg outline-none transition-all placeholder:text-white/20";
const labelClass = "text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/90 font-bold ml-1";

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
    <form onSubmit={handleSubmit} className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 p-8 md:p-10 rounded-2xl shadow-[0_0_50px_rgba(0,100,255,0.1)] relative overflow-hidden">
      {/* Glow corner */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066cc]/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="flex flex-col gap-7 relative z-10">
        
        {/* ── Fila 1: Nombre + Ciudad ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Nombre del Equipo *</label>
            <input type="text" name="name" required className={inputClass} placeholder="Ej. Real Madrid CF" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Ciudad base</label>
            <input type="text" name="city" className={inputClass} placeholder="Ej. Madrid, España" />
          </div>
        </div>

        {/* ── Fila 2: Color ── */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>Color Principal</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              name="primary_color" 
              defaultValue="#0066cc"
              className="w-14 h-14 bg-[#040c1a]/80 border border-[#0055cc]/50 rounded-lg cursor-pointer p-1"
            />
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Se usará para la UI del equipo
            </span>
          </div>
        </div>

        {/* ── Fila 3: Escudo ── */}
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
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#0055cc]/30">
          <Link href="/admin/teams" className="px-8 py-3.5 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-10 py-3.5 text-xs font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,170,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield size={16} />}
            {status === "submitting" ? "Creando..." : "Registrar Equipo"}
          </button>
        </div>

      </div>
    </form>
  );
}
