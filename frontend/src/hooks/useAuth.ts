/**
 * useAuth — Client-side JWT authentication utilities.
 *
 * The JWT is stored in localStorage after a successful login.
 * These helpers decode the token payload on the client (no signature
 * verification — that is handled server-side). They also check the `exp`
 * claim so that expired tokens are treated as absent.
 *
 * Security note: storing tokens in localStorage exposes them to XSS attacks.
 * For higher-security applications, prefer httpOnly cookies + CSRF tokens.
 */

/** Shape of the decoded JWT payload used by the app. */
interface TokenPayload {
  id: number;
  prenom: string;
  email: string;
  exp?: number;
}

/**
 * Decode a JWT and return its payload, or `null` if the token is absent,
 * malformed, or expired.
 *
 * @param token - Raw JWT string from localStorage (may be null)
 */
const decodeToken = (token: string | null): TokenPayload | null => {
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.id) return null;
		// Reject expired tokens
		if (payload.exp && payload.exp * 1000 < Date.now()) return null;
		return { id: payload.id, prenom: payload.prenom ?? "", email: payload.email ?? "" };
	} catch {
		return null;
	}
};

/**
 * Return the currently authenticated user, or `null` if not authenticated.
 *
 * Reads the JWT from `localStorage` and decodes it on every call.
 */
export const getUser = (): TokenPayload | null => {
	const token = localStorage.getItem("token");
	return decodeToken(token);
};

/**
 * Return the authenticated user's numeric id, or `0` if not authenticated.
 *
 * Convenience wrapper around `getUser()` for cases where only the id is needed.
 */
export const getUserId = (): number => {
	return getUser()?.id ?? 0;
};

/**
 * Return `true` if a valid, non-expired JWT is present in localStorage.
 */
export const isAuthenticated = (): boolean => {
	return getUser() !== null;
};
