export type TournamentFormat = 'GROUPS_AND_PLAYOFFS' | 'LEAGUE' | 'PLAYOFFS';

export type TournamentState = 'DRAFT' | 'GROUP_STAGE' | 'GROUPS_COMPLETED' | 'PLAYOFFS' | 'FINISHED';

export type IntegritySeverity = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface IntegrityStatus {
  severity: IntegritySeverity;
  label: string;
  description: string;
  color: string;
  dotColor: string;
  hasCalendarInconsistency: boolean;
  hasCriticalInconsistency: boolean;
  teamsWithNoMatches: any[];
  problematicMatchIds: string[];
}

export interface EngineAnalysis {
  format: TournamentFormat;
  isDoubleRound: boolean;
  state: TournamentState;
  integrity: IntegrityStatus;
  
  // Math & Stats
  teamsCount: number;
  totalMatches: number;
  matchesPlayed: number;
  matchesPending: number;
  
  // Stage specific
  groupMatchesCount: number;
  groupMatchesPlayed: number;
  groupMatchesPending: number;
  requiredGroupMatches: number;
  isGroupStageComplete: boolean;
  
  knockoutMatchesCount: number;
  knockoutMatchesPlayed: number;
  knockoutMatchesPending: number;
  
  theoreticalTotalMatches: number;
}

export class CompetitionEngine {
  /**
   * Sanitizes the tournament format, defaulting to GROUPS_AND_PLAYOFFS if empty or invalid
   */
  static getFormat(formatString: string | null | undefined): TournamentFormat {
    if (formatString === 'LEAGUE') return 'LEAGUE';
    if (formatString === 'PLAYOFFS') return 'PLAYOFFS';
    return 'GROUPS_AND_PLAYOFFS';
  }

  /**
   * Analyzes the tournament data and returns a comprehensive sports logic breakdown
   */
  static analyzeTournament(tournament: any, matches: any[] = []): EngineAnalysis {
    const teamsCount = tournament.tournament_teams?.length ?? 0;
    const format = this.getFormat(tournament.format);
    const isDoubleRound = !!tournament.is_double_round;

    // Filter matches by stage
    const groupMatches = matches.filter((m: any) => !m.is_knockout);
    const knockoutMatches = matches.filter((m: any) => m.is_knockout);

    const groupMatchesCount = groupMatches.length;
    const groupMatchesPlayed = groupMatches.filter((m: any) => m.status === 'FINISHED').length;
    const groupMatchesPending = groupMatchesCount - groupMatchesPlayed;

    const knockoutMatchesCount = knockoutMatches.length;
    const knockoutMatchesPlayed = knockoutMatches.filter((m: any) => m.status === 'FINISHED').length;
    const knockoutMatchesPending = knockoutMatchesCount - knockoutMatchesPlayed;

    const matchesPlayed = matches.filter((m: any) => m.status === 'FINISHED').length;
    const matchesPending = matches.length - matchesPlayed;

    // Calculate required group stage matches based on round-robin formulas
    let requiredGroupMatches = 0;
    if (format !== 'PLAYOFFS' && teamsCount >= 2) {
      const groups: Record<string, number> = {};
      let hasGroups = false;
      
      tournament.tournament_teams?.forEach((tt: any) => {
        const gName = tt.group_name || 'UNASSIGNED';
        hasGroups = true;
        groups[gName] = (groups[gName] || 0) + 1;
      });

      if (hasGroups) {
        for (const count of Object.values(groups)) {
          if (count >= 2) {
            const matchesInGroup = (count * (count - 1)) / 2;
            requiredGroupMatches += isDoubleRound ? matchesInGroup * 2 : matchesInGroup;
          }
        }
      } else {
        const singleRoundMatches = (teamsCount * (teamsCount - 1)) / 2;
        requiredGroupMatches = isDoubleRound ? singleRoundMatches * 2 : singleRoundMatches;
      }
    }

    // Determine if group stage is complete
    // Group stage is ONLY complete if all required matches are played, none are pending,
    // and there are no teams with 0 matches.
    const teamsWithNoMatches = format === 'PLAYOFFS' ? [] : (tournament.tournament_teams?.filter((tt: any) => {
      return !groupMatches.some((m: any) => 
        m.home_team_id === tt.team_id || m.away_team_id === tt.team_id
      );
    }) || []);

    const hasCalendarInconsistency = teamsWithNoMatches.length > 0;

    const isGroupStageComplete = format === 'PLAYOFFS'
      ? true
      : requiredGroupMatches > 0
        ? groupMatchesPlayed >= requiredGroupMatches && groupMatchesPending === 0 && !hasCalendarInconsistency
        : false;

    // Calculate theoretical total matches
    const theoreticalTotalMatches = requiredGroupMatches + knockoutMatchesCount;

    // Determine the state
    let state: TournamentState = 'DRAFT';
    if (format === 'PLAYOFFS') {
      if (knockoutMatchesCount === 0) {
        state = 'DRAFT';
      } else if (knockoutMatchesPending > 0) {
        state = 'PLAYOFFS';
      } else {
        state = 'FINISHED';
      }
    } else if (format === 'LEAGUE') {
      if (groupMatchesCount === 0) {
        state = 'DRAFT';
      } else if (groupMatchesPlayed < requiredGroupMatches || groupMatchesPending > 0) {
        state = 'GROUP_STAGE';
      } else {
        state = 'FINISHED';
      }
    } else { // GROUPS_AND_PLAYOFFS
      if (groupMatchesCount === 0) {
        state = 'DRAFT';
      } else if (!isGroupStageComplete) {
        state = 'GROUP_STAGE';
      } else if (knockoutMatchesCount === 0) {
        state = 'GROUPS_COMPLETED';
      } else if (knockoutMatchesPending > 0) {
        state = 'PLAYOFFS';
      } else {
        state = 'FINISHED';
      }
    }

    // Integrity Status Evaluation
    const hasKnockoutMatches = knockoutMatchesCount > 0;
    
    // Critical if playoff matches exist but groups are incomplete, OR teams have 0 matches and tournament is in progress
    const hasCriticalInconsistency = 
      (format === 'GROUPS_AND_PLAYOFFS' && hasKnockoutMatches && !isGroupStageComplete) || 
      (format !== 'PLAYOFFS' && hasCalendarInconsistency && matchesPlayed > 0);

    const problematicMatchIds: string[] = [];
    if (format === 'GROUPS_AND_PLAYOFFS' && hasKnockoutMatches && !isGroupStageComplete) {
      problematicMatchIds.push(...knockoutMatches.map((m: any) => m.id));
    }

    let severity: IntegritySeverity = 'HEALTHY';
    let label = 'Todo en orden';
    let description = 'Todos los equipos tienen sus partidos programados.';
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';

    if (hasCriticalInconsistency) {
      severity = 'CRITICAL';
      label = 'Hay un problema';
      description = 'Hay equipos sin partidos o se crearon las eliminatorias antes de terminar los grupos. Corrige el calendario para continuar.';
      color = 'text-red-400 bg-red-500/10 border-red-500/20';
      dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    } else if (
      (format !== 'PLAYOFFS' && (groupMatchesCount < requiredGroupMatches || hasCalendarInconsistency)) ||
      (format === 'GROUPS_AND_PLAYOFFS' && isGroupStageComplete && !hasKnockoutMatches)
    ) {
      severity = 'WARNING';
      label = format === 'GROUPS_AND_PLAYOFFS' && isGroupStageComplete ? 'Grupos terminados' : 'Faltan partidos';
      description = format === 'GROUPS_AND_PLAYOFFS' && isGroupStageComplete
        ? 'Ya puedes crear las eliminatorias.'
        : `Faltan partidos por programar: hay ${groupMatchesCount} de ${requiredGroupMatches}.`;
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
    }

    const integrity: IntegrityStatus = {
      severity,
      label,
      description,
      color,
      dotColor,
      hasCalendarInconsistency,
      hasCriticalInconsistency,
      teamsWithNoMatches,
      problematicMatchIds
    };

    return {
      format,
      isDoubleRound,
      state,
      integrity,
      teamsCount,
      totalMatches: matches.length,
      matchesPlayed,
      matchesPending,
      groupMatchesCount,
      groupMatchesPlayed,
      groupMatchesPending,
      requiredGroupMatches,
      isGroupStageComplete,
      knockoutMatchesCount,
      knockoutMatchesPlayed,
      knockoutMatchesPending,
      theoreticalTotalMatches
    };
  }

  /**
   * Helper to format state display labels
   */
  static getStateLabel(state: TournamentState): string {
    switch (state) {
      case 'DRAFT': return 'Borrador / Configuración';
      case 'GROUP_STAGE': return 'Fase de Grupos';
      case 'GROUPS_COMPLETED': return 'Grupos Finalizados';
      case 'PLAYOFFS': return 'Eliminatorias / Playoffs';
      case 'FINISHED': return 'Finalizado';
      default: return 'Desconocido';
    }
  }

  /**
   * Helper to format format display labels
   */
  static getFormatLabel(format: TournamentFormat, isDoubleRound: boolean = false): string {
    const suffix = isDoubleRound ? ' (Ida y Vuelta)' : ' (Ida)';
    switch (format) {
      case 'GROUPS_AND_PLAYOFFS': return `Grupos + Playoffs${suffix}`;
      case 'LEAGUE': return `Liga Directa${suffix}`;
      case 'PLAYOFFS': return 'Eliminatoria Directa / Copa';
      default: return 'Desconocido';
    }
  }

  /**
   * Calculates accurate Group/League stage standings exclusively from non-knockout FINISHED matches.
   * Prevents Semifinals/Finals (Copa Oro / Copa Plata) from polluting group stage PJ, DG, and PTS.
   */
  static calculateGroupStandings(
    enrolledTeams: any[] = [],
    matches: any[] = [],
    sport: string = 'FOOTBALL',
    fallbackStandings: any[] = []
  ) {
    const isVolley = sport === 'VOLLEYBALL' || sport === 'BEACH_VOLLEYBALL';

    // Build map of team metadata from enrolledTeams + fallbackStandings + match teams
    const statsMap = new Map<string, {
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
      volleyball_points_for: number;
      volleyball_points_against: number;
      points: number;
    }>();

    for (const tt of enrolledTeams) {
      const tId = tt.team_id || tt.id;
      if (!tId) continue;
      const fallback = fallbackStandings.find((f: any) => f.team_id === tId);
      const teamObj = Array.isArray(tt.team) ? tt.team[0] : tt.team;
      statsMap.set(tId, {
        team_id: tId,
        team_name: teamObj?.name || tt.team_name || fallback?.team_name || 'Equipo',
        logo_url: teamObj?.logo_url ?? tt.logo_url ?? fallback?.logo_url ?? null,
        group_name: tt.group_name ?? fallback?.group_name ?? null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        volleyball_points_for: 0,
        volleyball_points_against: 0,
        points: 0,
      });
    }

    // Filter ONLY finished group/league stage matches (exclude knockout matches!)
    const finishedGroupMatches = (matches || []).filter((m: any) => {
      if (m.status !== 'FINISHED') return false;
      if (m.is_knockout) return false;
      if (m.stage && m.stage !== 'GROUP' && m.stage !== 'GRUPOS' && m.stage !== 'LEAGUE') return false;
      return true;
    });

    for (const m of finishedGroupMatches) {
      const homeId = m.home_team_id;
      const awayId = m.away_team_id;
      const hScore = Number(m.home_score ?? 0);
      const aScore = Number(m.away_score ?? 0);

      // Calculate volleyball points from sets if available
      let hVolleyPts = 0;
      let aVolleyPts = 0;
      if (Array.isArray(m.match_sets)) {
        for (const s of m.match_sets) {
          if (s.status === 'FINISHED') {
            hVolleyPts += Number(s.home_points ?? 0);
            aVolleyPts += Number(s.away_points ?? 0);
          }
        }
      }

      const calcPoints = (myScore: number, oppScore: number) => {
        if (!isVolley) {
          if (myScore > oppScore) return 3;
          if (myScore === oppScore) return 1;
          return 0;
        } else {
          if (myScore > oppScore) {
            if (oppScore === 0 || (myScore === 3 && oppScore === 1)) return 3;
            if ((myScore === 3 && oppScore === 2) || (myScore === 2 && oppScore === 1)) return 2;
            return 3;
          } else if (myScore < oppScore) {
            if ((oppScore === 3 && myScore === 2) || (oppScore === 2 && myScore === 1)) return 1;
            return 0;
          }
          return 0;
        }
      };

      const homeSt = statsMap.get(homeId);
      if (homeSt) {
        if (m.home_team?.name && homeSt.team_name === 'Equipo') homeSt.team_name = m.home_team.name;
        if (m.home_team?.logo_url && !homeSt.logo_url) homeSt.logo_url = m.home_team.logo_url;
        homeSt.played += 1;
        if (hScore > aScore) homeSt.won += 1;
        else if (!isVolley && hScore === aScore) homeSt.drawn += 1;
        else if (hScore < aScore) homeSt.lost += 1;
        homeSt.goals_for += hScore;
        homeSt.goals_against += aScore;
        homeSt.goal_difference = homeSt.goals_for - homeSt.goals_against;
        homeSt.volleyball_points_for += hVolleyPts;
        homeSt.volleyball_points_against += aVolleyPts;
        homeSt.points += calcPoints(hScore, aScore);
      }

      const awaySt = statsMap.get(awayId);
      if (awaySt) {
        if (m.away_team?.name && awaySt.team_name === 'Equipo') awaySt.team_name = m.away_team.name;
        if (m.away_team?.logo_url && !awaySt.logo_url) awaySt.logo_url = m.away_team.logo_url;
        awaySt.played += 1;
        if (aScore > hScore) awaySt.won += 1;
        else if (!isVolley && aScore === hScore) awaySt.drawn += 1;
        else if (aScore < hScore) awaySt.lost += 1;
        awaySt.goals_for += aScore;
        awaySt.goals_against += hScore;
        awaySt.goal_difference = awaySt.goals_for - awaySt.goals_against;
        awaySt.volleyball_points_for += aVolleyPts;
        awaySt.volleyball_points_against += hVolleyPts;
        awaySt.points += calcPoints(aScore, hScore);
      }
    }

    return Array.from(statsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      const aVP = a.volleyball_points_for - a.volleyball_points_against;
      const bVP = b.volleyball_points_for - b.volleyball_points_against;
      if (bVP !== aVP) return bVP - aVP;
      return a.team_name.localeCompare(b.team_name);
    });
  }
}
