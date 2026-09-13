"use client";

import { useState } from "react";
import {
  createCategory,
  updateCategoryData,
  deleteCategory,
  addTeamToCategory,
  removeTeamFromCategory,
  bulkCreateAndEnrollTeams,
} from "@/app/admin/actions";
import {
  Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronRight,
  Users, Tag, AlertTriangle, Loader2, FileText
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  gender: string | null;
  min_age: number | null;
  max_age: number | null;
  display_order: number | null;
}

interface TournamentTeamRow {
  id: string;
  team_id: string;
  group_name: string | null;
  category_id: string | null;
  team?: { name: string; logo_url?: string | null } | null;
}

interface AvailableTeam {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface CategoryManagerProps {
  tournamentId: string;
  categories: Category[];
  enrolledTeams: TournamentTeamRow[];
  availableTeams: AvailableTeam[];
  onUpdate: () => void;
  isDisabled?: boolean;
}

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  MIXED: "Mixto",
};

const PRESET_CATEGORIES = [
  { label: "Sub-13 Masc.", name: "Sub-13 Masculino",  gender: "M",    min_age: 0, max_age: 13 },
  { label: "Sub-15 Masc.", name: "Sub-15 Masculino",  gender: "M",    min_age: 0, max_age: 15 },
  { label: "Sub-17 Masc.", name: "Sub-17 Masculino",  gender: "M",    min_age: 0, max_age: 17 },
  { label: "Sub-19 Masc.", name: "Sub-19 Masculino",  gender: "M",    min_age: 0, max_age: 19 },
  { label: "Sub-15 Fem.",  name: "Sub-15 Femenino",   gender: "F",    min_age: 0, max_age: 15 },
  { label: "Sub-17 Fem.",  name: "Sub-17 Femenino",   gender: "F",    min_age: 0, max_age: 17 },
  { label: "Abierto Masc.", name: "Abierto Masculino", gender: "M",   min_age: 0, max_age: null },
  { label: "Abierto Fem.",  name: "Abierto Femenino",  gender: "F",   min_age: 0, max_age: null },
  { label: "Mixto",         name: "Mixto Abierto",     gender: "MIXED", min_age: 0, max_age: null },
];

function genderBadge(gender: string | null) {
  const g = gender || "MIXED";
  const color = g === "M" ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
              : g === "F" ? "text-pink-400 bg-pink-500/10 border-pink-500/30"
              : "text-purple-400 bg-purple-500/10 border-purple-500/30";
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${color}`}>
      {GENDER_LABELS[g] || g}
    </span>
  );
}

export function CategoryManager({
  tournamentId,
  categories,
  enrolledTeams,
  availableTeams,
  onUpdate,
  isDisabled = false,
}: CategoryManagerProps) {
  // New category form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("MIXED");
  const [newMinAge, setNewMinAge] = useState("0");
  const [newMaxAge, setNewMaxAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState("MIXED");
  const [editMinAge, setEditMinAge] = useState("0");
  const [editMaxAge, setEditMaxAge] = useState("");

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const [enrollCategoryId, setEnrollCategoryId] = useState<string | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  
  // Bulk enroll state
  const [bulkEnrollCategoryId, setBulkEnrollCategoryId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState("");

  // Preset quick-add
  const [addingPreset, setAddingPreset] = useState<string | null>(null);

  const addPreset = async (preset: typeof PRESET_CATEGORIES[0]) => {
    setAddingPreset(preset.name);
    try {
      await createCategory(tournamentId, {
        name: preset.name,
        gender: preset.gender,
        min_age: preset.min_age,
        max_age: preset.max_age,
        display_order: categories.length,
      });
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAddingPreset(null);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    setError("");
    try {
      await createCategory(tournamentId, {
        name: newName.trim(),
        gender: newGender,
        min_age: parseInt(newMinAge) || 0,
        max_age: newMaxAge ? parseInt(newMaxAge) : null,
        display_order: categories.length,
      });
      setNewName(""); setNewGender("MIXED"); setNewMinAge("0"); setNewMaxAge("");
      setShowNewForm(false);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditGender(cat.gender || "MIXED");
    setEditMinAge(String(cat.min_age ?? 0));
    setEditMaxAge(cat.max_age != null ? String(cat.max_age) : "");
    setError("");
  };

  const saveEdit = async (catId: string) => {
    setSaving(true);
    setError("");
    try {
      await updateCategoryData(catId, {
        name: editName.trim(),
        gender: editGender,
        min_age: parseInt(editMinAge) || 0,
        max_age: editMaxAge ? parseInt(editMaxAge) : null,
      });
      setEditingId(null);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!confirm(`¿Eliminar la categoría "${catName}"? Se desvinculará de todos los equipos inscritos.`)) return;
    try {
      await deleteCategory(catId);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEnroll = async () => {
    if (!enrollCategoryId || selectedTeamIds.length === 0) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      await Promise.all(
        selectedTeamIds.map(teamId => addTeamToCategory(tournamentId, teamId, enrollCategoryId))
      );
      setSelectedTeamIds([]);
      setEnrollCategoryId(null);
      onUpdate();
    } catch (e: any) {
      setEnrollError(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (!bulkEnrollCategoryId || !bulkText.trim()) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      await bulkCreateAndEnrollTeams(tournamentId, bulkEnrollCategoryId, bulkText);
      setBulkEnrollCategoryId(null);
      setBulkText("");
      onUpdate();
    } catch (e: any) {
      setEnrollError(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (teamId: string, catId: string) => {
    try {
      await removeTeamFromCategory(tournamentId, teamId, catId);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Teams enrolled in a specific category
  const teamsInCategory = (catId: string) =>
    enrolledTeams.filter((t) => t.category_id === catId);

  // Teams NOT yet in this category (to show in dropdown)
  const availableForCategory = (catId: string) => {
    const enrolled = new Set(teamsInCategory(catId).map((t) => t.team_id));
    return availableTeams.filter((t) => !enrolled.has(t.id));
  };

  return (
    <div className="space-y-5">
      {/* ── Error global ── */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle size={13} />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-400/60 hover:text-red-400">
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Presets rápidos ── */}
      {!isDisabled && (
        <div className="flex flex-wrap gap-1.5">
          {PRESET_CATEGORIES.map((p) => {
            const alreadyExists = categories.some(
              (c) => c.name.toLowerCase() === p.name.toLowerCase()
            );
            return (
              <button
                key={p.label}
                disabled={alreadyExists || addingPreset !== null}
                onClick={() => addPreset(p)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all ${
                  alreadyExists
                    ? "bg-white/3 border-white/5 text-white/20 cursor-not-allowed"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 hover:text-[#00f0ff] cursor-pointer"
                }`}
              >
                {addingPreset === p.name ? (
                  <Loader2 size={10} className="animate-spin inline" />
                ) : (
                  <>+ {p.label}</>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lista de categorías ── */}
      {categories.length === 0 && !showNewForm && (
        <div className="rounded-2xl border border-dashed border-white/10 py-10 flex flex-col items-center gap-3">
          <Tag size={24} className="text-white/15" />
          <p className="text-white/30 text-xs text-center">
            Sin categorías — usa los presets o crea una manualmente.
          </p>
        </div>
      )}

      {categories
        .slice()
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((cat) => {
          const isEditing = editingId === cat.id;
          const catTeams = teamsInCategory(cat.id);
          const avail = availableForCategory(cat.id);
          const showEnroll = enrollCategoryId === cat.id;
          const isExpanded = expandedCategories.includes(cat.id) || showEnroll || isEditing;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-[#0055cc]/25 overflow-hidden transition-all duration-300"
              style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}
            >
              {/* Category header */}
              <div 
                className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#0055cc]/10 transition-colors ${isExpanded ? 'border-b border-[#0055cc]/15' : ''}`}
                onClick={() => { if (!isEditing) toggleCategory(cat.id); }}
              >
                <div className={`text-[#00f0ff]/50 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                  <ChevronRight size={16} />
                </div>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-transparent border-b border-[#00f0ff]/40 text-white font-bold text-sm focus:outline-none min-w-0 py-0.5"
                      autoFocus
                    />
                    <div className="relative">
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="appearance-none bg-[#0a1526] border border-white/10 rounded-lg text-[10px] text-white/60 px-2.5 py-1.5 pr-6 focus:outline-none"
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="MIXED">Mixto</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                    <input
                      type="number" value={editMinAge}
                      onChange={(e) => setEditMinAge(e.target.value)}
                      placeholder="Min" min="0" max="99"
                      className="w-12 bg-[#0a1526] border border-white/10 rounded text-[10px] text-white/60 px-2 py-1.5 text-center focus:outline-none"
                    />
                    <span className="text-white/20 text-[10px]">–</span>
                    <input
                      type="number" value={editMaxAge}
                      onChange={(e) => setEditMaxAge(e.target.value)}
                      placeholder="Max" min="0" max="99"
                      className="w-12 bg-[#0a1526] border border-white/10 rounded text-[10px] text-white/60 px-2 py-1.5 text-center focus:outline-none"
                    />
                      <button
                        onClick={(e) => { e.stopPropagation(); saveEdit(cat.id); }}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-all"
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-black uppercase tracking-wider text-white truncate">
                          {cat.name}
                        </span>
                        {genderBadge(cat.gender)}
                        {(cat.min_age || cat.max_age) && (
                          <span className="text-[9px] font-mono text-white/35">
                            {cat.min_age ?? 0}–{cat.max_age ?? "∞"} años
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#00f0ff]/60 font-bold shrink-0">
                        {catTeams.length} equipo{catTeams.length !== 1 ? "s" : ""}
                      </span>
                      {!isDisabled && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                            className="p-1.5 rounded-lg text-white/25 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all"
                            title="Editar categoría"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(cat.id, cat.name); }}
                            className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Eliminar categoría"
                          >
                            <Trash2 size={12} />
                          </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Teams enrolled in this category */}
              {isExpanded && (
                <div className="px-5 py-3 space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  {catTeams.length === 0 ? (
                    <p className="text-[10px] text-white/25 italic py-1">Sin equipos inscritos en esta categoría.</p>
                  ) : (
                  catTeams.map((tt) => (
                    <div key={tt.id} className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Users size={11} className="text-[#00f0ff]/40 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 truncate">
                          {tt.team?.name || tt.team_id}
                        </span>
                        {tt.group_name && (
                          <span className="text-[9px] font-mono text-[#00f0ff]/50 shrink-0">
                            Grp {tt.group_name}
                          </span>
                        )}
                      </div>
                      {!isDisabled && (
                        <button
                          onClick={() => handleUnenroll(tt.team_id, cat.id)}
                          className="shrink-0 p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Quitar de esta categoría"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  ))
                )}

                {/* Enroll team in this category */}
                {!isDisabled && (
                  showEnroll ? (
                    <div className="flex flex-col gap-3 mt-2 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-white/50">Selecciona los equipos a inscribir:</p>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                        {avail.length === 0 ? (
                          <span className="text-[10px] text-white/30 italic">No hay más equipos disponibles en el torneo.</span>
                        ) : (
                          avail.map(team => {
                            const isSelected = selectedTeamIds.includes(team.id);
                            return (
                              <button
                                key={team.id}
                                onClick={() => {
                                  setSelectedTeamIds(prev => prev.includes(team.id) ? prev.filter(id => id !== team.id) : [...prev, team.id]);
                                }}
                                disabled={enrolling}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                  isSelected 
                                    ? "bg-[#00f0ff]/10 border-[#00f0ff]/50 text-[#00f0ff]" 
                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                <div className={`w-3 h-3 rounded-sm flex items-center justify-center border transition-colors ${isSelected ? "bg-[#00f0ff] border-[#00f0ff]" : "border-white/30"}`}>
                                  {isSelected && <Check size={10} className="text-black" />}
                                </div>
                                {team.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => { setEnrollCategoryId(null); setEnrollError(""); setSelectedTeamIds([]); }}
                          className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 transition-all text-[10px] font-bold uppercase tracking-wider"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleEnroll}
                          disabled={selectedTeamIds.length === 0 || enrolling}
                          className="px-3 py-1.5 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-bold uppercase tracking-wider hover:bg-[#00f0ff]/25 disabled:opacity-40 transition-all flex items-center gap-1.5"
                        >
                          {enrolling ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                          Inscribir ({selectedTeamIds.length})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 pt-2 border-t border-transparent">
                      <button
                        onClick={() => { setEnrollCategoryId(cat.id); setEnrollError(""); setBulkEnrollCategoryId(null); setSelectedTeamIds([]); }}
                        className="flex items-center gap-1.5 text-[10px] text-[#00f0ff]/50 hover:text-[#00f0ff] font-bold uppercase tracking-wider transition-all"
                      >
                        <Plus size={11} /> Seleccionar equipos
                      </button>
                    </div>
                  )
                )}
                {enrollError && (enrollCategoryId === cat.id || bulkEnrollCategoryId === cat.id) && (
                  <p className="text-red-400 text-[10px] mt-1">{enrollError}</p>
                )}
              </div>
              )}
            </div>
          );
        })}

      {/* ── Crear nueva categoría manualmente ── */}
      {!isDisabled && (
        showNewForm ? (
          <div className="rounded-2xl border border-[#00f0ff]/20 overflow-hidden" style={{ background: "rgba(0,17,51,0.6)" }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#00f0ff]/10">
              <Tag size={12} className="text-[#00f0ff]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#00f0ff]">Nueva Categoría</span>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-2">
                <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Sub-17 Femenino"
                  autoFocus
                  className="w-full bg-[#0a1526] border border-white/10 rounded-xl text-xs text-white/80 px-3 py-2.5 focus:outline-none focus:border-[#00f0ff]/50"
                />
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block mb-1">Género</label>
                <div className="relative">
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full appearance-none bg-[#0a1526] border border-white/10 rounded-xl text-[11px] text-white/70 px-3 py-2.5 pr-7 focus:outline-none"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="MIXED">Mixto</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block mb-1">Min</label>
                  <input
                    type="number" value={newMinAge}
                    onChange={(e) => setNewMinAge(e.target.value)}
                    placeholder="0" min="0" max="99"
                    className="w-full bg-[#0a1526] border border-white/10 rounded-xl text-[11px] text-white/60 px-2.5 py-2.5 text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block mb-1">Max</label>
                  <input
                    type="number" value={newMaxAge}
                    onChange={(e) => setNewMaxAge(e.target.value)}
                    placeholder="∞" min="0" max="99"
                    className="w-full bg-[#0a1526] border border-white/10 rounded-xl text-[11px] text-white/60 px-2.5 py-2.5 text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/5">
              <button
                onClick={() => { setShowNewForm(false); setError(""); }}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white/70 border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/25 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Crear Categoría
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full py-3 rounded-2xl border border-dashed border-[#00f0ff]/20 text-[#00f0ff]/40 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <Plus size={13} />
            Crear categoría personalizada
          </button>
        )
      )}
    </div>
  );
}
