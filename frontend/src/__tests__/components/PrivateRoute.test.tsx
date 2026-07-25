import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeToken = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake_sig`;
};

const VALID_TOKEN = makeToken({
  id: 1,
  email: 'user@audely.fr',
  exp: Math.floor(Date.now() / 1000) + 3600,
});

/** Render PrivateRoute inside a MemoryRouter with a login fallback route */
const renderPrivateRoute = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<p>Page de connexion</p>} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <p>Contenu protégé</p>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PrivateRoute', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('redirects unauthenticated users to the login page', () => {
    renderPrivateRoute();
    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    localStorage.setItem('token', VALID_TOKEN);
    renderPrivateRoute();
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.queryByText('Page de connexion')).not.toBeInTheDocument();
  });

  it('redirects when the stored token is expired', () => {
    const expiredToken = makeToken({
      id: 1,
      email: 'old@audely.fr',
      exp: Math.floor(Date.now() / 1000) - 3600, // already expired
    });
    localStorage.setItem('token', expiredToken);
    renderPrivateRoute();
    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });
});
