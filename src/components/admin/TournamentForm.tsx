"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament } from "@/app/admin/actions";
import {
  Loader2, CheckCircle2, AlertTriangle, Trophy, Layers, Shield,
  Plus, Trash2, ChevronDown
} from "lucide-react";

type SportType = "FOOTBALL" | "VOLLEYBALL" | "BEACH_VOLLEYBALL" | "BASKETBALL" | "OTHER";
type FormatType = "GROUPS_AND_PLAYOFFS" | "LEAGUE" | "PLAYOFFS";

interface CategoryDraft {
  id: string; // local id for list tracking
  name: string;
  gender: "M" | "F" | "MIXED";
  min_age: string;
  max_age: string;
}

const SPORT_OPTIONS: { value: SportType; label: string; emoji: string; desc: string }[] = [
  { value: "FOOTBALL",       label: "Fútbol",          emoji: "⚽", desc: "Fútbol 5, 7, 11. Marcador por goles." },
  { value: "VOLLEYBALL",     label: "Voleibol",        emoji: "🏐", desc: "Voleibol de cancha. Marcador por sets." },
  { value: "BEACH_VOLLEYBALL", label: "Vóley Playa",  emoji: "🏖️", desc: "Parejas mixtas/genérico. 2 sets + tie-break." },
  { value: "OTHER",          label: "Otro Deporte",    emoji: "🎯", desc: "Formato estándar." },
];

const GENDER_OPTIONS = [
  { value: "M",     label: "Masculino" },
  { value: "F",     label: "Femenino" },
  { value: "MIXED", label: "Mixto" },
];

const PRESET_CATEGORIES: { label: string; name: string; gender: "M" | "F" | "MIXED"; min: string; max: string }[] = [
  { label: "Sub-13 Masc.",   name: "Sub-13 Masculino",   gender: "M",    min: "0", max: "13" },
  { label: "Sub-15 Masc.",   name: "Sub-15 Masculino",   gender: "M",    min: "0", max: "15" },
  { label: "Sub-17 Masc.",   name: "Sub-17 Masculino",   gender: "M",    min: "0", max: "17" },
  { label: "Sub-15 Fem.",    name: "Sub-15 Femenino",    gender: "F",    min: "0", max: "15" },
  { label: "Sub-17 Fem.",    name: "Sub-17 Femenino",    gender: "F",    min: "0", max: "17" },
  { label: "Abierto Masc.",  name: "Abierto Masculino",  gender: "M",    min: "0", max: "" },
  { label: "Abierto Fem.",   name: "Abierto Femenino",   gender: "F",    min: "0", max: "" },
  { label: "Mixto Abierto",  name: "Mixto Abierto",      gender: "MIXED",min: "0", max: "" },
];

function newCategory(): CategoryDraft {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    gender: "MIXED",
    min_age: "0",
    max_age: "",
  };
}

export function TournamentForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [maxTeams, setMaxTeams] = useState(10);
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState<SportType>("FOOTBALL");
  const [format, setFormat] = useState<FormatType>("GROUPS_AND_PLAYOFFS");
  const [isDoubleRound, setIsDoubleRound] = useState(false);
  const [volleyballBestOfSets, setVolleyballBestOfSets] = useState(5);
  const [volleyballSetPoints, setVolleyballSetPoints] = useState(25);
  const [volleyballTiebreakPoints, setVolleyballTiebreakPoints] = useState(15);
  const [categories, setCategories] = useState<CategoryDraft[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const addCategory = () => setCategories((prev) => [...prev, newCategory()]);

  const addPreset = (preset: typeof PRESET_CATEGORIES[0]) => {
    setCategories((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), name: preset.name, gender: preset.gender, min_age: preset.min, max_age: preset.max },
    ]);
  };

  const updateCategory = (id: string, field: keyof CategoryDraft, value: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));

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
        sport,
        is_double_round: format === "PLAYOFFS" ? false : isDoubleRound,
        volleyball_best_of_sets: volleyballBestOfSets,
        volleyball_set_points: volleyballSetPoints,
        volleyball_tiebreak_points: volleyballTiebreakPoints,
        registration_status: "OPEN",
        categories: categories
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            gender: c.gender,
            min_age: parseInt(c.min_age) || 0,
            max_age: c.max_age ? parseInt(c.max_age) : null,
          })),
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
            placeholder="Ej: Copa Bogotá Sub-17 2026"
            className="input-premium hero-title !not-italic text-xl !p-4"
          />
        </div>

        {/* Deporte */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Deporte</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SPORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSport(opt.value)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                  sport === opt.value
                    ? "bg-[#00f0ff]/5 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.12)]"
                    : "bg-[#02060d] border-[#0055cc]/30 hover:border-[#0055cc]/60"
                }`}
              >
                {sport === opt.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
                <span className="text-xl mb-1">{opt.emoji}</span>
                <span className={`font-bold text-xs uppercase tracking-wider ${sport === opt.value ? "text-[#00f0ff]" : "text-white/70"}`}>
                  {opt.label}
                </span>
                <span className="text-[9px] text-white/30 mt-0.5 leading-relaxed hidden sm:block">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formato del Torneo */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Formato de Competición</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {([
              { value: "GROUPS_AND_PLAYOFFS", Icon: Layers,  title: "Grupos + Playoffs", desc: "Fase de grupos todos-contra-todos y eliminatorias finales." },
              { value: "LEAGUE",              Icon: Trophy,  title: "Liga Directa",      desc: "Todos contra todos. El líder con más puntos gana." },
              { value: "PLAYOFFS",            Icon: Shield,  title: "Copa Directa",      desc: "Eliminación directa desde el inicio. Sin grupos." },
            ] as const).map(({ value, Icon, title, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormat(value)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                  format === value
                    ? "bg-[#00f0ff]/5 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                    : "bg-[#02060d] border-[#0055cc]/30 hover:border-[#0055cc]/60 hover:bg-[#0055cc]/5"
                }`}
              >
                <div className={`p-2 rounded-lg w-fit ${format === value ? "bg-[#00f0ff]/20 text-[#00f0ff]" : "bg-white/5 text-white/50"}`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider mt-3">{title}</h3>
                <p className="text-[10px] text-white/50 mt-1 leading-relaxed">{desc}</p>
                {format === value && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Doble Vuelta */}
        {format !== "PLAYOFFS" && (
          <div className="bg-[#02060d] border border-[#0055cc]/20 rounded-xl p-4 flex items-center justify-between transition-all hover:border-[#0055cc]/40">
            <div className="flex flex-col gap-0.5">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Permitir Ida y Vuelta</span>
              <span className="text-[10px] text-white/40">Los equipos jugarán dos veces entre sí (como local y visitante).</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDoubleRound(!isDoubleRound)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${isDoubleRound ? "bg-[#00f0ff]" : "bg-white/10"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-[#02060d] transition-all ${isDoubleRound ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        )}

        {(sport === "VOLLEYBALL" || sport === "BEACH_VOLLEYBALL") && (
          <div className="bg-[#02060d] border border-[#00f0ff]/20 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold">Formato de Sets</label>
              <select
                value={volleyballBestOfSets}
                onChange={(e) => setVolleyballBestOfSets(parseInt(e.target.value))}
                className="input-premium !p-3 text-sm"
              >
                <option value={1}>Mejor de 1 (Set Único)</option>
                <option value={3}>Mejor de 3</option>
                <option value={5}>Mejor de 5</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold">Set Regular</label>
              <input
                type="number"
                value={volleyballSetPoints}
                onChange={(e) => setVolleyballSetPoints(parseInt(e.target.value) || 25)}
                min="15"
                max="35"
                className="input-premium !p-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] text-brand-aqua/50 uppercase tracking-widest font-bold">Tie-break</label>
              <input
                type="number"
                value={volleyballTiebreakPoints}
                onChange={(e) => setVolleyballTiebreakPoints(parseInt(e.target.value) || 15)}
                min="7"
                max="25"
                className="input-premium !p-3 text-sm"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Ubicación / Ciudad</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Bogotá, Colombia"
              className="input-premium !p-4"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Límite de Equipos</label>
            <input
              type="number"
              value={maxTeams}
              onChange={(e) => setMaxTeams(parseInt(e.target.value))}
              min="2"
              max="200"
              className="input-premium !p-4"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">
              Categorías del Torneo
              <span className="ml-2 text-white/25 normal-case tracking-normal font-normal">(opcional — puede agregar después)</span>
            </label>
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-bold uppercase tracking-wider hover:bg-[#00f0ff]/20 transition-all"
            >
              <Plus size={12} />
              Nueva categoría
            </button>
          </div>

          {/* Presets rápidos */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CATEGORIES.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => addPreset(p)}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/50 font-bold uppercase tracking-wider hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 hover:text-[#00f0ff] transition-all"
              >
                + {p.label}
              </button>
            ))}
          </div>

          {/* Category rows */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center bg-[#02060d] border border-[#0055cc]/20 rounded-xl px-4 py-3"
                >
                  {/* Nombre */}
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategory(cat.id, "name", e.target.value)}
                    placeholder={`Categoría ${idx + 1}`}
                    className="bg-transparent border-b border-white/10 text-white/80 text-xs font-bold py-0.5 focus:outline-none focus:border-[#00f0ff]/50 placeholder-white/20 min-w-0"
                  />
                  {/* Género */}
                  <div className="relative">
                    <select
                      value={cat.gender}
                      onChange={(e) => updateCategory(cat.id, "gender", e.target.value)}
                      className="appearance-none bg-[#0a1526] border border-white/10 rounded-lg text-[10px] text-white/60 px-2.5 py-1.5 pr-6 focus:outline-none focus:border-[#00f0ff]/50"
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                  {/* Edad min */}
                  <input
                    type="number"
                    value={cat.min_age}
                    onChange={(e) => updateCategory(cat.id, "min_age", e.target.value)}
                    placeholder="Min"
                    min="0"
                    max="99"
                    className="w-14 bg-[#0a1526] border border-white/10 rounded-lg text-[10px] text-white/60 px-2 py-1.5 text-center focus:outline-none focus:border-[#00f0ff]/50"
                  />
                  {/* Edad max */}
                  <input
                    type="number"
                    value={cat.max_age}
                    onChange={(e) => updateCategory(cat.id, "max_age", e.target.value)}
                    placeholder="Max"
                    min="0"
                    max="99"
                    className="w-14 bg-[#0a1526] border border-white/10 rounded-lg text-[10px] text-white/60 px-2 py-1.5 text-center focus:outline-none focus:border-[#00f0ff]/50"
                  />
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {categories.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 flex flex-col items-center gap-2">
              <span className="text-[10px] text-white/25 text-center">
                Sin categorías — el torneo será de categoría única.<br />
                Usa los botones de presets o crea una manualmente.
              </span>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold">Descripción / Reglamento</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el formato, reglas especiales, premios..."
            rows={3}
            className="input-premium !p-4 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-brand-navy/30">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-premium-teal w-full !py-4"
          >
            {status === "submitting" ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creando Torneo...</>
            ) : status === "success" ? (
              <><CheckCircle2 className="w-4 h-4" />¡Torneo Creado!</>
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
