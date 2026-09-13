export type VolleyballSport = "VOLLEYBALL" | "BEACH_VOLLEYBALL";

export interface VolleyballSet {
  id?: string;
  match_id?: string;
  set_number: number;
  home_points: number | null;
  away_points: number | null;
  status?: string | null;
  winner_team_id?: string | null;
}

export interface VolleyballMatchConfig {
  sport?: string | null;
  volleyball_best_of_sets?: number | null;
  volleyball_set_points?: number | null;
  volleyball_tiebreak_points?: number | null;
}

export interface VolleyballMatchLike {
  home_team_id?: string | null;
  away_team_id?: string | null;
  match_sets?: VolleyballSet[] | null;
  tournament?: VolleyballMatchConfig | null;
}

export interface VolleyballSetResult extends VolleyballSet {
  targetPoints: number;
  isComplete: boolean;
  winnerSide: "home" | "away" | null;
}

export interface VolleyballSummary {
  bestOfSets: number;
  setsToWin: number;
  setPoints: number;
  tiebreakPoints: number;
  sets: VolleyballSetResult[];
  homeSetsWon: number;
  awaySetsWon: number;
  homePointsTotal: number;
  awayPointsTotal: number;
  currentSetNumber: number;
  winnerTeamId: string | null;
  isComplete: boolean;
}

export function isVolleyballSport(sport?: string | null): sport is VolleyballSport {
  return sport === "VOLLEYBALL" || sport === "BEACH_VOLLEYBALL";
}

export function getVolleyballConfig(config?: VolleyballMatchConfig | null) {
  const isBeach = config?.sport === "BEACH_VOLLEYBALL";
  const bestOfSets = config?.volleyball_best_of_sets ?? (isBeach ? 3 : 5);
  return {
    bestOfSets,
    setsToWin: Math.floor(bestOfSets / 2) + 1,
    setPoints: config?.volleyball_set_points ?? 25,
    tiebreakPoints: config?.volleyball_tiebreak_points ?? 15,
  };
}

export function getVolleyballSetTarget(setNumber: number, bestOfSets: number, setPoints: number, tiebreakPoints: number) {
  return setNumber === bestOfSets ? tiebreakPoints : setPoints;
}

export function resolveVolleyballSet(
  set: VolleyballSet,
  bestOfSets: number,
  setPoints: number,
  tiebreakPoints: number
): VolleyballSetResult {
  const home = set.home_points ?? 0;
  const away = set.away_points ?? 0;
  const targetPoints = getVolleyballSetTarget(set.set_number, bestOfSets, setPoints, tiebreakPoints);
  const diff = Math.abs(home - away);
  const reachedTarget = home >= targetPoints || away >= targetPoints;
  const isComplete = reachedTarget && diff >= 2;
  const winnerSide = !isComplete ? null : home > away ? "home" : "away";

  return {
    ...set,
    home_points: home,
    away_points: away,
    targetPoints,
    isComplete,
    winnerSide,
  };
}

export function summarizeVolleyballMatch(match: VolleyballMatchLike): VolleyballSummary {
  const config = getVolleyballConfig(match.tournament);
  const rawSets = [...(match.match_sets ?? [])].sort((a, b) => a.set_number - b.set_number);
  const sets = rawSets.map((set) =>
    resolveVolleyballSet(set, config.bestOfSets, config.setPoints, config.tiebreakPoints)
  );

  let homeSetsWon = 0;
  let awaySetsWon = 0;
  let homePointsTotal = 0;
  let awayPointsTotal = 0;

  for (const set of sets) {
    homePointsTotal += set.home_points ?? 0;
    awayPointsTotal += set.away_points ?? 0;
    if (set.winnerSide === "home") homeSetsWon += 1;
    if (set.winnerSide === "away") awaySetsWon += 1;
  }

  const isComplete = homeSetsWon >= config.setsToWin || awaySetsWon >= config.setsToWin;
  const winnerTeamId = !isComplete
    ? null
    : homeSetsWon > awaySetsWon
      ? match.home_team_id ?? null
      : match.away_team_id ?? null;

  const firstOpenSet = sets.find((set) => !set.isComplete);
  const nextSetNumber = Math.min(sets.length + 1, config.bestOfSets);
  const currentSetNumber = isComplete
    ? sets[sets.length - 1]?.set_number ?? 1
    : firstOpenSet?.set_number ?? nextSetNumber;

  return {
    ...config,
    sets,
    homeSetsWon,
    awaySetsWon,
    homePointsTotal,
    awayPointsTotal,
    currentSetNumber,
    winnerTeamId,
    isComplete,
  };
}

export function formatVolleyballSets(sets?: VolleyballSet[] | null): string {
  if (!sets || sets.length === 0) return "";
  return [...sets]
    .sort((a, b) => a.set_number - b.set_number)
    .map((set) => `${set.home_points ?? 0}-${set.away_points ?? 0}`)
    .join(" / ");
}
