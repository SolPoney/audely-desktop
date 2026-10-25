import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

import pool from '../../config/db.js';
import webpush from 'web-push';
import { envoyerRappelsDuJour } from '../../services/notificationService.js';

const mockExecute = vi.mocked(pool.execute);
const mockSendNotification = vi.mocked(webpush.sendNotification);

const abonnement = (overrides: Partial<Record<string, any>> = {}) => ({
  id_utilisateur: 1,
  endpoint: 'https://push.example.com/abc',
  p256dh: 'p256dh-key',
  auth: 'auth-key',
  streak: 0,
  jours_depuis_activite: 1,
  ...overrides,
});

describe('envoyerRappelsDuJour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hors du créneau horaire (18h) → ne fait rien, aucune requête SQL", async () => {
    const maintenant = new Date('2026-10-25T10:00:00');
    const res = await envoyerRappelsDuJour(maintenant);

    expect(res).toEqual({ envoyes: 0, erreurs: 0, horsCreneau: true });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('dans le créneau, aucun abonné à notifier → 0 envoi', async () => {
    mockExecute.mockResolvedValueOnce([[]]);
    const maintenant = new Date('2026-10-25T18:05:00');
    const res = await envoyerRappelsDuJour(maintenant);

    expect(res).toEqual({ envoyes: 0, erreurs: 0, horsCreneau: false });
  });

  it('envoie une notification à chaque abonné éligible et journalise le résultat', async () => {
    mockExecute
      .mockResolvedValueOnce([[abonnement()]])  // SELECT abonnés
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT NotificationEnvoyee
    mockSendNotification.mockResolvedValueOnce({} as any);

    const res = await envoyerRappelsDuJour(new Date('2026-10-25T18:00:00'));

    expect(res.envoyes).toBe(1);
    expect(res.erreurs).toBe(0);
    expect(mockSendNotification).toHaveBeenCalledWith(
      { endpoint: 'https://push.example.com/abc', keys: { p256dh: 'p256dh-key', auth: 'auth-key' } },
      expect.any(String),
    );
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO NotificationEnvoyee'),
      expect.arrayContaining([1]),
    );
  });

  it('abonnement périmé (410 Gone) → supprimé, pas de ligne NotificationEnvoyee', async () => {
    mockExecute.mockResolvedValueOnce([[abonnement()]]);
    const erreurPerimee = Object.assign(new Error('Gone'), { statusCode: 410 });
    mockSendNotification.mockRejectedValueOnce(erreurPerimee);
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE AbonnementPush

    const res = await envoyerRappelsDuJour(new Date('2026-10-25T18:00:00'));

    expect(res.envoyes).toBe(0);
    expect(res.erreurs).toBe(1);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM AbonnementPush'),
      ['https://push.example.com/abc'],
    );
    const insertNotifCalls = mockExecute.mock.calls.filter((c) =>
      String(c[0]).includes('INSERT INTO NotificationEnvoyee'));
    expect(insertNotifCalls.length).toBe(0);
  });

  it('erreur d\'envoi non liée à un abonnement périmé → comptée en erreur, abonnement conservé', async () => {
    mockExecute.mockResolvedValueOnce([[abonnement()]]);
    mockSendNotification.mockRejectedValueOnce(new Error('network down'));

    const res = await envoyerRappelsDuJour(new Date('2026-10-25T18:00:00'));

    expect(res.erreurs).toBe(1);
    const deleteCalls = mockExecute.mock.calls.filter((c) =>
      String(c[0]).includes('DELETE FROM AbonnementPush'));
    expect(deleteCalls.length).toBe(0);
  });

  it('absence ≥ 3 jours → message de relance douce (pas un message encourageant standard)', async () => {
    mockExecute
      .mockResolvedValueOnce([[abonnement({ jours_depuis_activite: 5 })]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    mockSendNotification.mockResolvedValueOnce({} as any);

    await envoyerRappelsDuJour(new Date('2026-10-25T18:00:00'));

    const [, params] = mockExecute.mock.calls[1] as [string, any[]];
    expect(params[1]).toMatch(/^relance_/);
  });
});
