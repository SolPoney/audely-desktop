import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
	Moon, Sun, LogOut, Headphones, Music, BarChart2,
	Flame, Zap,
} from "lucide-react";
import { API_URL } from "../config/api";

const getPrenom = (): string => {
	try {
		const token = localStorage.getItem("token");
		if (!token) return "";
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.prenom || "";
	} catch {
		return "";
	}
};

interface Niveau { nom: string; niveau: number; prevXP: number; nextXP: number | null; xpPct: number; }

const DashboardPage = () => {
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const prenom = getPrenom();

	const [xp, setXp]               = useState<number | null>(null);
	const [niveau, setNiveau]        = useState<Niveau | null>(null);
	const [streak, setStreak]        = useState(0);
	const [queteNb, setQueteNb]      = useState(0);
	const [queteTotal, setQueteTotal] = useState(3);
	const [queteFaite, setQueteFaite] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/api/stats`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => r.ok ? r.json() : null)
			.then(data => {
				if (!data) return;
				setXp(data.xp ?? 0);
				setNiveau(data.niveau ?? null);
				setStreak(data.streak ?? 0);
			})

		fetch(`${API_URL}/api/quete-du-jour`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => r.ok ? r.json() : null)
			.then(data => {
				if (!data) return;
				setQueteNb(data.nbFaits ?? 0);
				setQueteTotal(data.exercices?.length ?? 3);
				setQueteFaite(data.complete ?? false);
			})
			.catch(() => {});
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	const xpToNext = xp !== null && niveau?.nextXP !== null ? (niveau!.nextXP! - xp) : null;

	return (
		<div className="dashboard-page">
			<a href="#main-content" className="skip-link">Aller au contenu principal</a>

			<main id="main-content" className="dashboard-main dashboard-main--home">

				{/* ── Hero ── */}
				<div className="db-hero">
					<div className="db-hero-inner">

						{/* Actions top-right */}
						<div className="db-hero-actions">
							<button type="button" className="db-hero-btn-icon" onClick={toggleTheme}
								aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}>
								{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
							</button>
							<button type="button" className="db-hero-btn-icon" onClick={handleLogout} aria-label="Se déconnecter">
								<LogOut size={17} />
							</button>
						</div>

						{/* Greeting */}
						<div className="db-hero-body">
							<div className="db-hero-avatar" aria-hidden="true">
								{prenom ? prenom[0].toUpperCase() : "A"}
							</div>
							<div className="db-hero-text">
								<h1 className="db-hero-title">
									{prenom ? `Bonjour, ${prenom}\u00A0!` : "Bonjour\u00A0!"}
								</h1>
								<p className="db-hero-sub">Prêt à vous entraîner aujourd'hui&nbsp;?</p>
							</div>
						</div>

						{/* XP & niveau */}
						{xp !== null && niveau && (
							<div className="db-hero-xp">
								<div className="db-hero-xp-chips">
									<span className="db-hero-chip db-hero-chip--niveau">
										{niveau.nom}&nbsp;·&nbsp;Niv.&nbsp;{niveau.niveau}
									</span>
									{streak > 0 && (
										<span className="db-hero-chip db-hero-chip--streak"
											aria-label={`${streak} jours consécutifs`}>
											<Flame size={12} strokeWidth={2.5} aria-hidden="true" />
											{streak}&nbsp;jour{streak > 1 ? "s" : ""}
										</span>
									)}
									<span className="db-hero-chip db-hero-chip--xp">{xp.toLocaleString("fr-FR")}&nbsp;XP</span>
								</div>

								{niveau.nextXP !== null && (
									<>
										<div
											className="db-hero-xpbar"
											role="progressbar"
											aria-valuenow={niveau.xpPct}
											aria-valuemin={0}
											aria-valuemax={100}
											aria-label={`Progression XP : ${niveau.xpPct}%`}
										>
											<div className="db-hero-xpbar-fill" style={{ width: `${niveau.xpPct}%` }} />
										</div>
										{xpToNext !== null && (
											<p className="db-hero-xp-hint">
												Plus que&nbsp;<strong>{xpToNext}&nbsp;XP</strong> pour le niveau&nbsp;{niveau.niveau + 1}
											</p>
										)}
									</>
								)}
							</div>
						)}

					</div>
				</div>

				{/* ── Quête du jour ── */}
				<div className="db-section">
					<div className="db-section-inner">
						<button
							type="button"
							className={`db-quete-card ${queteFaite ? "db-quete-card--done" : ""}`}
							onClick={() => navigate("/quete")}
						>
							<div className="db-quete-left">
								<div className="db-quete-icon" aria-hidden="true">
									<Zap size={22} color="white" strokeWidth={2} />
								</div>
								<div>
									<p className="db-quete-titre">Quête du jour</p>
									<p className="db-quete-sub">
										{queteFaite
											? "Terminée ! Revenez demain 🎉"
											: `${queteNb} / ${queteTotal} exercices`}
									</p>
								</div>
							</div>
							<div className="db-quete-right">
								<div className="db-quete-pct">{Math.round((queteNb / queteTotal) * 100)}%</div>
								<div className="db-quete-bar">
									<div className="db-quete-bar-fill" style={{ width: `${Math.round((queteNb / queteTotal) * 100)}%` }} />
								</div>
							</div>
						</button>
					</div>
				</div>

				{/* ── Cartes ── */}
				<div className="db-section">
					<div className="db-section-inner">
						<p className="db-section-label">Que voulez-vous faire ?</p>
						<nav aria-label="Navigation principale">
							<ul className="db-choix" role="list">
								<li>
									<button type="button" className="db-card db-card--teal"
										onClick={() => navigate("/parcours")}
										aria-label="Accéder aux parcours d'entraînement">
										<div className="db-card-icon-wrap" aria-hidden="true">
											<div className="db-card-icon db-card-icon--teal">
												<Headphones size={34} color="white" strokeWidth={1.6} />
											</div>
										</div>
										<div className="db-card-text">
											<p className="db-card-titre">Parcours</p>
											<p className="db-card-sous">Programme guidé et progressif adapté à votre niveau</p>
										</div>
									</button>
								</li>
								<li>
									<button type="button" className="db-card db-card--violet"
										onClick={() => navigate("/exercices")}
										aria-label="Choisir un exercice libre">
										<div className="db-card-icon-wrap" aria-hidden="true">
											<div className="db-card-icon db-card-icon--violet">
												<Music size={34} color="white" strokeWidth={1.6} />
											</div>
										</div>
										<div className="db-card-text">
											<p className="db-card-titre">Exercices libres</p>
											<p className="db-card-sous">Choisissez librement parmi tous les exercices disponibles</p>
										</div>
									</button>
								</li>
								<li>
									<button type="button" className="db-card db-card--green"
										onClick={() => navigate("/stats")}
										aria-label="Voir mes progrès">
										<div className="db-card-icon-wrap" aria-hidden="true">
											<div className="db-card-icon db-card-icon--green">
												<BarChart2 size={34} color="white" strokeWidth={1.6} />
											</div>
										</div>
										<div className="db-card-text">
											<p className="db-card-titre">Mes progrès</p>
											<p className="db-card-sous">Scores, statistiques, badges et historique de vos sessions</p>
										</div>
									</button>
								</li>
							</ul>
						</nav>
					</div>
				</div>

			</main>
		</div>
	);
};

export default DashboardPage;
