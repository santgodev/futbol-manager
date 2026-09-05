"use client";

import { useState, useMemo } from "react";
import { Calendar, BarChart2, Trophy, GitMerge } from "lucide-react";
import { FixtureTab } from "./FixtureTab";
import { PublicGroupStandings } from "./PublicGroupStandings";
import { RankingTab } from "./RankingTab";
import { KnockoutBracket } from "./KnockoutBracket";

interface StandingRow {
  team_id: string;
  team_name: string;
  logo_url: string | null;
  group_name: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

interface Match {
  id: string;
  match_date: string | null;
  match_time: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  stage: string;
  round_number: number | null;
  home_team?: { name: string; logo_url?: string | null } | null;
  away_team?: { name: string; logo_url?: string | null } | null;
  group_name?: string | null;
  venue?: string | null;
  bracket_order?: number | null;
}

interface TournamentTabsViewProps {
  tournament: any;
  categories: any[];
  matches: Match[];
  standings: StandingRow[];
  totalTeams?: number;
}

type TabId = "fixture" | "standings" | "ranking" | "bracket";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "fixture", label: "Fixture y Resultados", icon: Calendar },
  { id: "standings", label: "Tablas de Posiciones", icon: BarChart2 },
  { id: "ranking", label: "Ranking General", icon: Trophy },
  { id: "bracket", label: "Llaves y Resultados", icon: GitMerge },
];

/** Determine the current active phase label from matches */
function getActivePhase(matches: Match[]): string {
  const stageOrder = ["FINAL", "THIRD_PLACE", "SEMIFINAL", "QUARTERFINAL", "ROUND_16", "ROUND_32", "GROUP"];
  const stagesPresent = new Set(matches.map((m) => m.stage));

  // Prefer the highest knockout stage that has scheduled/live matches
  const liveOrScheduled = matches.filter(
    (m) =>
      m.status === "LIVE" ||
      m.status === "IN_PLAY" ||
      m.status === "SCHEDULED" ||
      m.status === "PRÓXIMO"
  );

  for (const stage of stageOrder) {
    if (liveOrScheduled.some((m) => m.stage === stage)) {
      return stageBadgeLabel(stage);
    }
  }

  // Fall back to last finished stage
  for (const stage of stageOrder) {
    if (stagesPresent.has(stage)) {
      return stageBadgeLabel(stage);
    }
  }

  return "FASE DE GRUPOS";
}

function stageBadgeLabel(stage: string): string {
  switch (stage) {
    case "GROUP": return "FASE DE GRUPOS";
    case "ROUND_32": return "RONDA DE 32";
    case "ROUND_16": return "OCTAVOS DE FINAL";
    case "QUARTERFINAL": return "CUARTOS DE FINAL";
    case "SEMIFINAL": return "SEMIFINAL";
    case "FINAL": return "GRAN FINAL";
    case "THIRD_PLACE": return "TERCER PUESTO";
    default: return stage;
  }
}

export function TournamentTabsView({ tournament, categories, matches, standings, totalTeams = 0 }: TournamentTabsViewProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories?.[0]?.id || null);
  const [activeTab, setActiveTab] = useState<TabId>("fixture");

  // ── FILTER BY ACTIVE CATEGORY ──
  const activeTeams = useMemo(() => {
    return activeCategoryId
      ? tournament?.tournament_teams?.filter((tt: any) => tt.category_id === activeCategoryId) || []
      : tournament?.tournament_teams || [];
  }, [tournament, activeCategoryId]);

  const activeMatches = useMemo(() => {
    return activeCategoryId
      ? matches.filter((m: any) => m.category_id === activeCategoryId)
      : matches;
  }, [matches, activeCategoryId]);

  const activeStandings = useMemo(() => {
    return activeCategoryId
      ? standings.filter((s: any) => activeTeams.some((tt: any) => tt.team_id === s.team_id))
      : standings;
  }, [standings, activeTeams, activeCategoryId]);

  const activePhase = useMemo(() => getActivePhase(activeMatches), [activeMatches]);

  // Group matches — fixtures only for GROUP stage, knockout for bracket tab
  const groupMatches = useMemo(
    () => activeMatches.filter((m) => m.stage === "GROUP"),
    [activeMatches]
  );

  // Show both group + knockout in fixture, but always show knockout in bracket
  const hasKnockout = useMemo(
    () =>
      activeMatches.some(
        (m) =>
          m.stage === "QUARTERFINAL" ||
          m.stage === "SEMIFINAL" ||
          m.stage === "FINAL" ||
          m.stage === "THIRD_PLACE" ||
          m.stage === "ROUND_16" ||
          m.stage === "ROUND_32"
      ),
    [activeMatches]
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      {/* ── SELECTOR DE CATEGORÍA ── */}
      {categories && categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-[#97CADB] uppercase tracking-widest mr-2 block w-full sm:w-auto mb-2 sm:mb-0">
              Categoría
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 shadow-sm ${
                  activeCategoryId === cat.id
                    ? "bg-[#018ABE] text-white shadow-[0_5px_15px_rgba(1,138,190,0.4)] border border-[#018ABE]"
                    : "bg-[#001B48] text-[#97CADB] border border-[#018ABE]/30 hover:bg-[#018ABE]/20 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phase Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-mono text-[#97CADB] uppercase tracking-widest">
          Fase Activa:
        </span>
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#018ABE]/20 border border-[#018ABE]/40 text-[#D6E8EE] text-[10px] font-black uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6E8EE] animate-pulse" />
          {activePhase}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 pb-1 mb-6 custom-scrollbar border-b border-[#018ABE]/30">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-[1.5rem] whitespace-nowrap text-[12px] font-bold uppercase tracking-wider transition-all shrink-0 border-b-2 -mb-[1px] ${
                isActive
                  ? "text-[#D6E8EE] border-[#018ABE] bg-[#02457A]/40"
                  : "text-[#97CADB] border-transparent hover:text-white hover:bg-[#02457A]/20"
              }`}
            >
              <Icon size={14} className={isActive ? "text-[#018ABE]" : "text-current"} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === "fixture" && "Fixture"}
                {tab.id === "standings" && "Posiciones"}
                {tab.id === "ranking" && "Ranking"}
                {tab.id === "bracket" && "Llaves"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "fixture" && (
          <FixtureTab matches={activeMatches} />
        )}

        {activeTab === "standings" && (
          activeStandings.length > 0 ? (
            <PublicGroupStandings standings={activeStandings} />
          ) : (
            <EmptyState text="No hay tablas de posiciones disponibles aún." />
          )
        )}

        {activeTab === "ranking" && (
          activeStandings.length > 0 ? (
            <RankingTab standings={activeStandings} />
          ) : (
            <EmptyState text="No hay suficientes datos para el ranking." />
          )
        )}

        {activeTab === "bracket" && (
          hasKnockout ? (
            <KnockoutBracket matches={activeMatches} />
          ) : (
            <EmptyState text="Aún no hay fases eliminatorias programadas." />
          )
        )}
      </div>

    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <Trophy size={20} className="text-white/20" />
      </div>
      <p className="text-white/30 text-sm text-center">{text}</p>
    </div>
  );
}
