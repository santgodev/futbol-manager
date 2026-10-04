/** Traduce el estado interno de un torneo a un texto simple en español. */
export function tournamentStatusLabel(status?: string | null): string {
  const s = (status || "").toUpperCase().replace(/\s+/g, "_");
  switch (s) {
    case "DRAFT":
    case "UPCOMING":
    case "PRÓXIMAMENTE":
    case "PROXIMAMENTE":
      return "Próximamente";
    case "REGISTRATION":
    case "INSCRIPCIONES":
      return "Inscripciones";
    case "IN_PROGRESS":
    case "EN_CURSO":
    case "ACTIVE":
      return "En curso";
    case "FINISHED":
    case "COMPLETED":
    case "FINALIZADO":
      return "Terminado";
    default:
      return status || "—";
  }
}

export function sportLabel(sport?: string | null): string {
  return sport === "VOLLEYBALL" ? "Voleibol" : "Fútbol";
}
