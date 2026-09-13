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
      const singleRoundMatches = (teamsCount * (teamsCount - 1)) / 2;
      requiredGroupMatches = isDoubleRound ? singleRoundMatches * 2 : singleRoundMatches;
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
    let label = 'Calendario válido';
    let description = 'Todos los equipos inscritos tienen partidos y el fixture de fase de grupos cubre los enfrentamientos requeridos.';
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';

    if (hasCriticalInconsistency) {
      severity = 'CRITICAL';
      label = 'Crítico: Integridad Corrupta';
      description = 'El torneo presenta inconsistencias graves. Se han generado eliminatorias sin concluir grupos, o existen equipos sin partidos programados mientras el torneo ya está en marcha. Se han bloqueado las operaciones administrativas clave.';
      color = 'text-red-400 bg-red-500/10 border-red-500/20';
      dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    } else if (
      (format !== 'PLAYOFFS' && (groupMatchesCount < requiredGroupMatches || hasCalendarInconsistency)) ||
      (format === 'GROUPS_AND_PLAYOFFS' && isGroupStageComplete && !hasKnockoutMatches)
    ) {
      severity = 'WARNING';
      label = 'Advertencia: Calendario incompleto';
      description = format === 'GROUPS_AND_PLAYOFFS' && isGroupStageComplete
        ? 'La fase de grupos ha finalizado con éxito. Listo para generar las eliminatorias de playoffs.'
        : `Faltan partidos de fase de grupos por programar. Se requieren ${requiredGroupMatches} partidos para todos contra todos y actualmente hay ${groupMatchesCount} programados.`;
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
}
