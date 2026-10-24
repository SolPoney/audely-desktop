import { describe, it, expect, vi } from 'vitest';
import { mettreAJourSerie } from '../../services/serieService.js';

const jourLocal = (offsetJours: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetJours);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
};

/** Connexion mockée : 1er execute = SELECT ... FOR UPDATE, 2e = INSERT/UPDATE. */
const makeConnection = (existingRow: any | null) => {
  const execute = vi.fn()
    .mockResolvedValueOnce([existingRow ? [existingRow] : []])
    .mockResolvedValueOnce([{}]);
  return { execute } as any;
};

describe('mettreAJourSerie', () => {
  it('aucune ligne existante → crée la série à 1, record 1, 1 gel', async () => {
    const connection = makeConnection(null);
    const res = await mettreAJourSerie(connection, 1);

    expect(res).toEqual({
      streakAvant: 0,
      streakActuelle: 1,
      streakRecord: 1,
      gelUtilise: false,
      gelsDisponibles: 1,
      nouveauRecord: true,
    });
  });

  it('déjà actif aujourd\'hui → aucun changement', async () => {
    const connection = makeConnection({
      serie_actuelle: 5,
      serie_record: 5,
      dernier_jour_actif: jourLocal(0),
      gels_disponibles: 1,
      derniere_recharge_gel: jourLocal(0),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.streakAvant).toBe(5);
    expect(res.streakActuelle).toBe(5);
    expect(res.gelUtilise).toBe(false);
  });

  it('dernier jour actif = hier → +1', async () => {
    const connection = makeConnection({
      serie_actuelle: 5,
      serie_record: 5,
      dernier_jour_actif: jourLocal(1),
      gels_disponibles: 1,
      derniere_recharge_gel: jourLocal(1),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.streakAvant).toBe(5);
    expect(res.streakActuelle).toBe(6);
    expect(res.streakRecord).toBe(6);
    expect(res.nouveauRecord).toBe(true);
    expect(res.gelUtilise).toBe(false);
  });

  it('dernier jour actif = avant-hier + gel disponible → le gel couvre le trou, +1', async () => {
    const connection = makeConnection({
      serie_actuelle: 5,
      serie_record: 10,
      dernier_jour_actif: jourLocal(2),
      gels_disponibles: 1,
      derniere_recharge_gel: jourLocal(2),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.streakActuelle).toBe(6);
    expect(res.gelUtilise).toBe(true);
    expect(res.gelsDisponibles).toBe(0);
  });

  it('dernier jour actif = avant-hier, pas de gel disponible → série remise à 1', async () => {
    const connection = makeConnection({
      serie_actuelle: 5,
      serie_record: 10,
      dernier_jour_actif: jourLocal(2),
      gels_disponibles: 0,
      derniere_recharge_gel: jourLocal(2),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.streakActuelle).toBe(1);
    expect(res.gelUtilise).toBe(false);
    expect(res.streakRecord).toBe(10); // le record n'est jamais réduit
  });

  it('dernier jour actif il y a 10 jours → série remise à 1, même avec un gel disponible (le gel ne couvre qu\'un seul jour)', async () => {
    const connection = makeConnection({
      serie_actuelle: 20,
      serie_record: 20,
      dernier_jour_actif: jourLocal(10),
      gels_disponibles: 1,
      derniere_recharge_gel: jourLocal(10),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.streakActuelle).toBe(1);
    expect(res.gelUtilise).toBe(false);
  });

  it('recharge automatique d\'un gel après 7 jours sans gel disponible', async () => {
    const connection = makeConnection({
      serie_actuelle: 3,
      serie_record: 3,
      dernier_jour_actif: jourLocal(1),
      gels_disponibles: 0,
      derniere_recharge_gel: jourLocal(8),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.gelsDisponibles).toBe(1);
  });

  it('pas de recharge si moins de 7 jours se sont écoulés', async () => {
    const connection = makeConnection({
      serie_actuelle: 3,
      serie_record: 3,
      dernier_jour_actif: jourLocal(1),
      gels_disponibles: 0,
      derniere_recharge_gel: jourLocal(3),
    });
    const res = await mettreAJourSerie(connection, 1);

    expect(res.gelsDisponibles).toBe(0);
  });
});
