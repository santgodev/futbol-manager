"use client";

import { useEffect, useState, useMemo } from "react";
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
  volleyball_points_for?: number;
  volleyball_points_against?: number;
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
  category_id?: string | null;
  is_knockout?: boolean;
  match_sets?: MatchSet[] | null;
}

interface MatchSet {
  id: string;
  set_number: number;
  home_points: number | null;
  away_points: number | null;
  status: string | null;
  winner_team_id: string | null;
}

interface TournamentTeam {
  team_id: string;
  category_id?: string | null;
}

interface TournamentData {
  sport?: string | null;
  tournament_teams?: TournamentTeam[] | null;
}

interface TournamentCategory {
  id: string;
  name: string;
}

interface TournamentTabsViewProps {
  tournament: TournamentData;
  categories: TournamentCategory[];
  matches: Match[];
  standings: StandingRow[];
  totalTeams?: number;
}

type TabId = "fixture" | "standings" | "ranking" | "bracket";

function isTabId(value: string): value is TabId {
  return value === "fixture" || value === "standings" || value === "ranking" || value === "bracket";
}

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

export function TournamentTabsView({ tournament, categories, matches, standings }: TournamentTabsViewProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories?.[0]?.id || null);
  const [activeTab, setActiveTab] = useState<TabId>("fixture");

  useEffect(() => {
    const applyHashTab = () => {
      const hashTab = window.location.hash.replace("#", "");
      if (isTabId(hashTab)) setActiveTab(hashTab);
    };

    const handleTabChange = (event: Event) => {
      const tabId = (event as CustomEvent<{ tabId?: string }>).detail?.tabId;
      if (tabId && isTabId(tabId)) setActiveTab(tabId);
    };

    applyHashTab();
    window.addEventListener("hashchange", applyHashTab);
    window.addEventListener("tournament-tab-change", handleTabChange);

    return () => {
      window.removeEventListener("hashchange", applyHashTab);
      window.removeEventListener("tournament-tab-change", handleTabChange);
    };
  }, []);

  // ── FILTER BY ACTIVE CATEGORY ──
  const activeTeams = useMemo(() => {
    return activeCategoryId
      ? tournament?.tournament_teams?.filter((tt) => tt.category_id === activeCategoryId) || []
      : tournament?.tournament_teams || [];
  }, [tournament, activeCategoryId]);

  const activeMatches = useMemo(() => {
    return activeCategoryId
      ? matches.filter((m) => m.category_id === activeCategoryId)
      : matches;
  }, [matches, activeCategoryId]);

  const activeStandings = useMemo(() => {
    return activeCategoryId
      ? standings.filter((s) => activeTeams.some((tt) => tt.team_id === s.team_id))
      : standings;
  }, [standings, activeTeams, activeCategoryId]);

  const activePhase = useMemo(() => getActivePhase(activeMatches), [activeMatches]);

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
    <section id="tournament-tabs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      {/* ── SELECTOR DE CATEGORÍA ── */}
      {categories && categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mr-2 block w-full sm:w-auto mb-2 sm:mb-0">
              Categoría
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                  activeCategoryId === cat.id
                    ? "bg-[#00f0ff] text-[#001122] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80"
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
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          Fase Activa:
        </span>
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-black uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
          {activePhase}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 pb-1 mb-6 custom-scrollbar border-b border-white/5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl whitespace-nowrap text-[12px] font-bold uppercase tracking-wider transition-all shrink-0 border-b-2 -mb-[1px] ${
                isActive
                  ? "text-[#00f0ff] border-[#00f0ff] bg-[#00f0ff]/5"
                  : "text-white/40 border-transparent hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon size={13} className={isActive ? "text-[#00f0ff]" : "text-current"} />
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
            <PublicGroupStandings standings={activeStandings} sport={tournament?.sport} />
          ) : (
            <EmptyState text="No hay tablas de posiciones disponibles aún." />
          )
        )}

        {activeTab === "ranking" && (
          activeStandings.length > 0 ? (
            <RankingTab standings={activeStandings} sport={tournament?.sport} />
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
