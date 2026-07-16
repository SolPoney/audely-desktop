const decodeToken = (token: string | null): { id: number; prenom: string; email: string } | null => {
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.id) return null;
		// Vérifier expiration
		if (payload.exp && payload.exp * 1000 < Date.now()) return null;
		return { id: payload.id, prenom: payload.prenom ?? "", email: payload.email ?? "" };
	} catch {
		return null;
	}
};

export const getUser = () => {
	const token = localStorage.getItem("token");
	return decodeToken(token);
};

export const getUserId = (): number => {
	return getUser()?.id ?? 0;
};

export const isAuthenticated = (): boolean => {
	return getUser() !== null;
};
