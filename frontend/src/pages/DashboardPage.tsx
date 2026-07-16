import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
	Moon, Sun, LogOut, Headphones, Music, ChevronRight, BarChart2,
	Flame, Play, Trophy, Zap, Award, Star, TrendingUp,
} from "lucide-react";
import { API_URL } from "../config/api";

const WAVE_HEIGHTS = [8, 14, 20, 12, 26, 18, 10, 22, 16, 28, 12, 20, 8, 24, 16, 10, 18, 26, 14, 20, 8, 22, 16, 12, 28];

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

interface Badge { id: string; emoji: string; titre: string; description: string; unlocked: boolean; }
interface Niveau { nom: string; niveau: number; prevXP: number; nextXP: number | null; xpPct: number; }

/* ── Config visuelle par badge ── */
const BADGE_CFG: Record<string, { icon: React.ReactNode; gradient: string; glow: string }> = {
	premier_pas: {
		icon:     <Play     size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #93C5FD 0%, #3B82F6 55%, #1D4ED8 100%)",
		glow:     "rgba(59,130,246,0.45)",
	},
	score_parfait: {
		icon:     <Trophy   size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)",
		glow:     "rgba(245,158,11,0.5)",
	},
	serie_3: {
		icon:     <Flame    size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #FCA5A5 0%, #EF4444 55%, #DC2626 100%)",
		glow:     "rgba(239,68,68,0.45)",
	},
	serie_7: {
		icon:     <Zap      size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #C4B5FD 0%, #7C3AED 55%, #5B21B6 100%)",
		glow:     "rgba(124,58,237,0.45)",
	},
	dix_sessions: {
		icon:     <Award    size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #6EE7B7 0%, #10B981 55%, #047857 100%)",
		glow:     "rgba(16,185,129,0.45)",
	},
	facile_maitrise: {
		icon:     <Star     size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #FEF08A 0%, #EAB308 45%, #92400E 100%)",
		glow:     "rgba(234,179,8,0.5)",
	},
	niveau_moyen: {
		icon:     <TrendingUp size={20} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #67E8F9 0%, #06B6D4 55%, #0E7490 100%)",
		glow:     "rgba(6,182,212,0.45)",
	},
};

const DashboardPage = () => {
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const prenom = getPrenom();

	const [xp, setXp]        = useState<number | null>(null);
	const [niveau, setNiveau] = useState<Niveau | null>(null);
	const [badges, setBadges] = useState<Badge[]>([]);
	const [streak, setStreak] = useState(0);

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/api/stats`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => r.ok ? r.json() : null)
			.then(data => {
				if (!data) return;
				setXp(data.xp ?? 0);
				setNiveau(data.niveau ?? null);
				setBadges(data.badges ?? []);
				setStreak(data.streak ?? 0);
			})
			.catch(() => {});
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	const unlockedCount = badges.filter(b => b.unlocked).length;

	return (
		<div className="dashboard-page">
			<a href="#main-content" className="skip-link">Aller au contenu principal</a>

			<main id="main-content" className="dashboard-main dashboard-main--home">

				{/* ── Hero ── */}
				<div className="db-hero">
					<div className="db-hero-inner">
						<div className="db-hero-actions">
							<button type="button" className="db-hero-btn-icon" onClick={toggleTheme}
								aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}>
								{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
							</button>
							<button type="button" className="db-hero-btn-icon" onClick={handleLogout} aria-label="Se déconnecter">
								<LogOut size={16} />
							</button>
						</div>
						<div className="db-hero-body">
							<div className="db-hero-avatar" aria-hidden="true">
								{prenom ? prenom[0].toUpperCase() : "A"}
							</div>
							<div>
								<h1 className="db-hero-title">Bonjour{prenom ? ` ${prenom}` : ""}&nbsp;!</h1>
								<p className="db-hero-sub">Prêt à vous entraîner aujourd'hui&nbsp;?</p>
							</div>
						</div>
					</div>
					<div className="db-hero-wave" aria-hidden="true">
						{WAVE_HEIGHTS.map((h, i) => (
							<div key={i} className="db-hero-wave-bar" style={{ height: `${h}px` }} />
						))}
					</div>
				</div>

				{/* ── Bande XP ── */}
				{xp !== null && niveau && (
					<div className="db-xp-strip">
						<div className="db-xp-strip-row1">
							<div className="db-xp-strip-meta">
								<span className="db-niveau-dot" aria-hidden="true" />
								<span className="db-niveau-nom">{niveau.nom}</span>
								<span className="db-niveau-tag">Niv.&nbsp;{niveau.niveau}</span>
							</div>
							<div className="db-xp-strip-end">
								{streak > 0 && (
									<span className="db-streak-chip" aria-label={`${streak} jours consécutifs`}>
										<Flame size={11} strokeWidth={2.5} aria-hidden="true" />
										{streak}j
									</span>
								)}
								<span className="db-xp-count">{xp}&nbsp;XP</span>
							</div>
						</div>
						<div className="db-xp-strip-row2">
							<div
								className="db-xp-strip-bar"
								role="progressbar"
								aria-valuenow={niveau.xpPct}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`Progression XP : ${niveau.xpPct}%`}
							>
								<div className="db-xp-strip-fill" style={{ width: `${niveau.xpPct}%` }} />
							</div>
							{niveau.nextXP !== null && (
								<span className="db-xp-hint">
									{niveau.nextXP - xp}&nbsp;XP → niv.&nbsp;{niveau.niveau + 1}
								</span>
							)}
						</div>
					</div>
				)}

				{/* ── Cartes de navigation ── */}
				<div className="db-section">
					<div className="db-section-inner">
						<p className="db-section-label">Commencez votre séance</p>
						<nav aria-label="Navigation principale">
							<ul className="db-choix" role="list">
								<li>
									<button type="button" className="db-card" onClick={() => navigate("/parcours")}
										aria-label="Accéder aux parcours d'entraînement">
										<div className="db-card-icon db-card-icon--teal" aria-hidden="true">
											<Headphones size={32} color="white" strokeWidth={1.6} />
										</div>
										<div className="db-card-text">
											<p className="db-card-titre">Parcours d'entraînement</p>
											<p className="db-card-sous">Suivez un programme guidé adapté à votre progression</p>
										</div>
										<ChevronRight size={20} className="db-card-chevron" aria-hidden="true" />
									</button>
								</li>
								<li>
									<button type="button" className="db-card" onClick={() => navigate("/exercices")}
										aria-label="Choisir un exercice libre">
										<div className="db-card-icon db-card-icon--violet" aria-hidden="true">
											<Music size={32} color="white" strokeWidth={1.6} />
										</div>
										<div className="db-card-text">
											<p className="db-card-titre">Choisir un exercice</p>
											<p className="db-card-sous">Accédez à tous les exercices disponibles</p>
										</div>
										<ChevronRight size={20} className="db-card-chevron" aria-hidden="true" />
									</button>
								</li>
								<li>
									<button type="button" className="db-card" onClick={() => navigate("/stats")}
										aria-label="Voir mes progrès">
										<div className="db-card-icon db-card-icon--green" aria-hidden="true">
											<BarChart2 size={32} color="white" strokeWidth={1.6} />
										</div>
										<div className="db-card-text">
											<p className="db-card-titre">Mes progrès</p>
											<p className="db-card-sous">Consultez vos scores et votre progression</p>
										</div>
										<ChevronRight size={20} className="db-card-chevron" aria-hidden="true" />
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
