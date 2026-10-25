export interface MessageRappel {
  id: string;
  titre: string;
  corps: string;
}

/**
 * Messages envoyés tant que l'absence est récente (< SEUIL_RELANCE_JOURS) —
 * toujours positifs, jamais culpabilisants (recommandation du document
 * Duolingo pour ce public en rééducation).
 */
export const MESSAGES_ENCOURAGEANTS: MessageRappel[] = [
  { id: 'enc_1', titre: 'Audely', corps: "Un petit exercice avant ce soir ?" },
  { id: 'enc_2', titre: 'Audely', corps: "Quelques minutes aujourd'hui, un grand pas pour votre oreille." },
  { id: 'enc_3', titre: 'Audely', corps: "Votre entraînement du jour est prêt quand vous l'êtes." },
  { id: 'enc_4', titre: 'Audely', corps: "Un court exercice, et la journée est validée." },
];

/**
 * Messages après une absence plus longue (≥ SEUIL_RELANCE_JOURS) — une
 * relance plus directe, mais qui laisse la main, sans culpabiliser.
 */
export const MESSAGES_RELANCE_DOUCE: MessageRappel[] = [
  { id: 'relance_1', titre: 'Audely', corps: "On ne vous a pas vu depuis quelques jours. Revenez quand vous voulez, sans pression." },
  { id: 'relance_2', titre: 'Audely', corps: "Une pause, pas de souci. Audely sera là quand vous serez prêt." },
];
