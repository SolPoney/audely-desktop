import { describe, it, expect, vi } from 'vitest';

// Fichier séparé exprès : ce test vérifie le comportement quand les clés
// VAPID ne sont *pas* définies, donc il ne doit jamais toucher à
// process.env.VAPID_* (contrairement à notificationService.test.ts, qui
// les définit via vi.hoisted pour tout le reste de la suite).

vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));
vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() },
}));

import pool from '../../config/db.js';
import { envoyerRappelsDuJour } from '../../services/notificationService.js';

describe('envoyerRappelsDuJour — clés VAPID absentes', () => {
  it("ne plante pas et renvoie vapidNonConfigure:true plutôt que de lever une exception", async () => {
    delete process.env.VAPID_SUBJECT;
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    const res = await envoyerRappelsDuJour(new Date('2026-10-25T18:00:00'));

    expect(res.vapidNonConfigure).toBe(true);
    expect(vi.mocked(pool.execute)).not.toHaveBeenCalled();
  });
});
