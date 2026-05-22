"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { createTournament } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";

const inputClass = "w-full bg-[#040c1a]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] px-4 py-3.5 text-white rounded-lg outline-none transition-all placeholder:text-white/20";
const labelClass = "text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/90 font-bold ml-1";

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name:        formData.get("name") as string,
      location:    formData.get("location") as string,
      description: formData.get("description") as string,
      status:      formData.get("status") as string,
      category:    formData.get("category") as string,
      image_url:   (formData.get("image_url") as string) || null,
    };

    try {
      const res = await createTournament(data);
      if (res.success) {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 p-8 md:p-10 rounded-2xl shadow-[0_0_50px_rgba(0,100,255,0.1)] relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066cc]/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex flex-col gap-7 relative z-10">

          {/* ── Fila 1: Nombre + Sede ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Nombre del Torneo *</label>
              <input type="text" name="name" required className={inputClass} placeholder="Ej. Liga Premier Bogotá" />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Sede / Ciudad *</label>
              <input type="text" name="location" required className={inputClass} placeholder="Ej. Bogotá, Colombia" />
            </div>
          </div>

          {/* ── Fila 2: Estado + Categoría ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Estado *</label>
              <select name="status" required className={inputClass + " appearance-none cursor-pointer"}>
                <option value="PRÓXIMAMENTE"       className="bg-[#040c1a]">Próximamente</option>
                <option value="INSCRIPCIONES ABIERTAS" className="bg-[#040c1a]">Inscripciones Abiertas</option>
                <option value="EN CURSO"           className="bg-[#040c1a]">En Curso</option>
                <option value="FINALIZADO"         className="bg-[#040c1a]">Finalizado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Categoría *</label>
              <select name="category" required defaultValue="Adultos" className={inputClass + " appearance-none cursor-pointer"}>
                {/* Por edades */}
                <optgroup label="── Por Edad ──">
                  <option value="Infantil A (Sub-8)"  className="bg-[#040c1a]">Infantil A (Sub-8)</option>
                  <option value="Infantil B (Sub-10)" className="bg-[#040c1a]">Infantil B (Sub-10)</option>
                  <option value="Infantil C (Sub-12)" className="bg-[#040c1a]">Infantil C (Sub-12)</option>
                  <option value="Prejuvenil (Sub-14)" className="bg-[#040c1a]">Prejuvenil (Sub-14)</option>
                  <option value="Juvenil (Sub-17)"    className="bg-[#040c1a]">Juvenil (Sub-17)</option>
                  <option value="Sub-20"              className="bg-[#040c1a]">Sub-20</option>
                  <option value="Adultos"             className="bg-[#040c1a]">Adultos</option>
                  <option value="Masters (35+)"       className="bg-[#040c1a]">Masters (35+)</option>
                </optgroup>
                {/* Por género */}
                <optgroup label="── Por Género ──">
                  <option value="Femenino"            className="bg-[#040c1a]">Femenino</option>
                  <option value="Mixto"               className="bg-[#040c1a]">Mixto</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* ── Fila 3: Descripción ── */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Descripción Breve</label>
            <textarea
              name="description"
              rows={3}
              className={inputClass + " resize-none"}
              placeholder="Detalles sobre el torneo, premios, reglas, etc."
            />
          </div>

          {/* ── Fila 4: Logo ── */}
          <ImageUpload
            name="image_url"
            label="Logo del Torneo (Opcional)"
            bucket="logos"
            folder="tournaments"
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-lg">
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#0055cc]/30">
            <Link href="/admin" className="px-8 py-3.5 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-10 py-3.5 text-xs font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,170,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Shield size={16} />
              {loading ? "Creando..." : "Crear Torneo"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
