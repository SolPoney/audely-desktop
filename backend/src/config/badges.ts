export interface BadgeDef {
  id: string;
  emoji: string;
  titre: string;
  description: string;
}

/**
 * Liste unique des badges, partagée par statsController (affichage de la
 * liste complète + état débloqué/verrouillé) et badgeService (détection des
 * badges nouvellement débloqués après un résultat, pour la révélation sur
 * l'écran de fin — voir ResultScreen.tsx).
 */
export const BADGES: BadgeDef[] = [
  { id: 'premier_pas', emoji: '🚀', titre: 'Premier pas', description: 'Complétez votre premier exercice' },
  { id: 'score_parfait', emoji: '🏆', titre: "Oreille d'or", description: 'Obtenez 100% sur un exercice' },
  { id: 'dix_sessions', emoji: '💪', titre: 'Persévérant', description: '10 sessions au total' },
  { id: 'facile_maitrise', emoji: '⭐', titre: 'Bases solides', description: 'Terminez tous les exercices Facile' },
  { id: 'niveau_moyen', emoji: '🎯', titre: 'En progression', description: 'Commencez les exercices Moyen' },
  { id: 'serie_3', emoji: '🔥', titre: 'Star', description: '3 jours consécutifs' },
  { id: 'serie_5', emoji: '🔥', titre: 'Superstar', description: '5 jours consécutifs' },
  { id: 'serie_7', emoji: '⚡', titre: 'Champion', description: '7 jours consécutifs' },
  { id: 'serie_14', emoji: '⚡', titre: 'Enflammé', description: '14 jours consécutifs' },
  { id: 'serie_31', emoji: '🏅', titre: 'Icône', description: '31 jours consécutifs' },
  { id: 'serie_50', emoji: '🥇', titre: 'Éminence', description: '50 jours consécutifs' },
  { id: 'serie_100', emoji: '🛡️', titre: 'Invincible', description: '100 jours consécutifs' },
  { id: 'serie_365', emoji: '🌟', titre: 'Interstellaire', description: '365 jours consécutifs' },
];

export interface StatsPourBadges {
  totalSessions: number;
  maxScore: number;
  facileDone: number;
  facileTotal: number;
  moyenNb: number;
  streak: number;
}

/** Condition de déblocage d'un badge, évaluée à partir de statistiques déjà calculées. */
export const estDebloque = (id: string, s: StatsPourBadges): boolean => {
  switch (id) {
    case 'premier_pas':     return s.totalSessions >= 1;
    case 'score_parfait':   return s.maxScore >= 100;
    case 'dix_sessions':    return s.totalSessions >= 10;
    case 'facile_maitrise': return s.facileTotal > 0 && s.facileDone >= s.facileTotal;
    case 'niveau_moyen':    return s.moyenNb >= 1;
    case 'serie_3':         return s.streak >= 3;
    case 'serie_5':         return s.streak >= 5;
    case 'serie_7':         return s.streak >= 7;
    case 'serie_14':        return s.streak >= 14;
    case 'serie_31':        return s.streak >= 31;
    case 'serie_50':        return s.streak >= 50;
    case 'serie_100':       return s.streak >= 100;
    case 'serie_365':       return s.streak >= 365;
    default:                return false;
  }
};
