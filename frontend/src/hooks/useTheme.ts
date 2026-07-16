import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
	const [theme, setTheme] = useState<Theme>(() => {
		// 1. Préférence sauvegardée en localStorage
		const saved = localStorage.getItem("theme") as Theme | null;
		if (saved) return saved;
		// 2. Sinon, préférence système (RGAA 10.13 — respect des préférences utilisateur)
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () =>
		setTheme((current) => (current === "light" ? "dark" : "light"));

	return { theme, toggleTheme };
};
