"use client";

import { useState } from "react";
import { createPlayer, deletePlayer } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Loader2, Plus, User, Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";

const inputClass = "w-full bg-[#040c1a]/80 border border-[#0055cc]/50 focus:border-[#00f0ff] px-3 py-2 text-white text-xs rounded-lg outline-none transition-all placeholder:text-white/20";
const labelClass = "text-[9px] uppercase tracking-[0.15em] text-[#00f0ff]/70 font-bold ml-1 mb-1 block";

export function TeamRoster({ teamId, initialPlayers }: { teamId: string, initialPlayers: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      team_id: teamId,
      name: formData.get("name") as string,
      document_id: (formData.get("document_id") as string) || null,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      number: formData.get("number") ? parseInt(formData.get("number") as string) : null,
      position: formData.get("position") as string,
      photo_url: (formData.get("photo_url") as string) || null,
    };

    try {
      await createPlayer(data);
      setStatus("idle");
      setIsAdding(false);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Error al registrar jugador");
    }
  };

  const handleDelete = async (playerId: string) => {
    if (!confirm("¿Desactivar jugador? Ya no aparecerá en el Roster actual pero sus estadísticas históricas se conservarán.")) return;
    try {
      await deletePlayer(playerId, teamId);
    } catch (err) {
      console.error("Error borrando jugador", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Formulario (Colapsable) ── */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border border-dashed border-[#0055cc]/50 rounded-xl text-[#00f0ff] text-xs font-bold uppercase tracking-widest hover:bg-[#0055cc]/10 hover:border-[#00f0ff]/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Agregar Nuevo Jugador
        </button>
      ) : (
        <div className="bg-[#001122]/80 border border-[#0055cc]/40 rounded-xl p-6 relative">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <User size={16} className="text-[#00f0ff]" /> Ficha de Registro
          </h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Foto */}
            <div className="md:w-1/2">
              <ImageUpload
                name="photo_url"
                label="Foto Perfil (Opcional)"
                bucket="logos"
                folder="players"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre Completo *</label>
                <input type="text" name="name" required className={inputClass} placeholder="Ej. Lionel Messi" />
              </div>
              <div>
                <label className={labelClass}>Documento de Identidad *</label>
                <input type="text" name="document_id" required className={inputClass} placeholder="Ej. 1020304050" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Fecha de Nacimiento *</label>
                <input type="date" name="date_of_birth" required className={inputClass + " [color-scheme:dark]"} />
              </div>
              <div>
                <label className={labelClass}>Dorsal (#)</label>
                <input type="number" name="number" min="1" max="99" className={inputClass} placeholder="Ej. 10" />
              </div>
              <div>
                <label className={labelClass}>Posición</label>
                <select name="position" required className={inputClass + " appearance-none"}>
                  <option value="PORTERO" className="bg-[#040c1a]">Portero</option>
                  <option value="DEFENSA" className="bg-[#040c1a]">Defensa</option>
                  <option value="MEDIOCAMPISTA" className="bg-[#040c1a]">Mediocampista</option>
                  <option value="DELANTERO" className="bg-[#040c1a]">Delantero</option>
                </select>
              </div>
            </div>

            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#0055cc]/30">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-6 py-2.5 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={status === "submitting"}
                className="bg-[#0066cc] text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#00aaff] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Jugador"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Lista de Jugadores ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#0055cc]/20">
              <th className="py-3 px-4 text-[9px] font-bold text-[#00f0ff]/50 uppercase tracking-widest">Jugador</th>
              <th className="py-3 px-4 text-[9px] font-bold text-[#00f0ff]/50 uppercase tracking-widest">Documento</th>
              <th className="py-3 px-4 text-[9px] font-bold text-[#00f0ff]/50 uppercase tracking-widest">Edad/Nacimiento</th>
              <th className="py-3 px-4 text-[9px] font-bold text-[#00f0ff]/50 uppercase tracking-widest">Posición</th>
              <th className="py-3 px-4 text-[9px] font-bold text-[#00f0ff]/50 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialPlayers.map((p) => {
              // Calcular edad básica si hay fecha
              let age = "";
              if (p.date_of_birth) {
                const birth = new Date(p.date_of_birth);
                const diffMs = Date.now() - birth.getTime();
                const ageDt = new Date(diffMs); 
                age = Math.abs(ageDt.getUTCFullYear() - 1970) + " años";
              }

              return (
                <tr key={p.id} className="border-b border-[#0055cc]/10 hover:bg-[#002255]/20 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#001122] border border-[#0055cc]/30 flex items-center justify-center overflow-hidden shrink-0">
                        {p.photo_url ? (
                          <Image src={p.photo_url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <User size={16} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          {p.number && <span className="text-[10px] bg-[#0055cc]/30 px-1.5 py-0.5 rounded text-[#00f0ff]">#{p.number}</span>}
                          {p.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-white/60 font-mono">{p.document_id || "—"}</td>
                  <td className="py-3 px-4 text-xs text-white/60">
                    <div className="flex flex-col">
                      <span>{age || "—"}</span>
                      {p.date_of_birth && <span className="text-[9px] text-white/30">{p.date_of_birth}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-white/80 uppercase tracking-wider">{p.position || "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Desactivar jugador"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {initialPlayers.length === 0 && (
          <div className="py-12 text-center text-white/30 text-xs font-bold uppercase tracking-widest border-b border-[#0055cc]/20">
            El roster está vacío
          </div>
        )}
      </div>

    </div>
  );
}
