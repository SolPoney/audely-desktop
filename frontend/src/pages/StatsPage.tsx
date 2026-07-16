import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	ChevronLeft, Flame, TrendingUp, Award, Target,
	Play, Trophy, Zap, Star,
} from "lucide-react";
import { API_URL } from "../config/api";

const TYPE_LABEL: Record<string, string> = {
	detecter:                "Détecter",
	reconnaitre:             "Reconnaître",
	grave_aigu:              "Grave / Aigu",
	reconnaitre_rythme:      "Rythme",
	distinguer:              "Distinguer",
	court_moyen_long:        "Court / Long",
	decision_orthographique: "Orthographe",
	comprendre:              "Comprendre",
	memoriser:               "Mémoriser",
	percevoir:               "Percevoir",
	identifier:              "Identifier",
	themes:                  "Thèmes",
};

const TYPE_COLOR: Record<string, string> = {
	detecter:                "#0D9488",
	reconnaitre:             "#0284C7",
	grave_aigu:              "#7C3AED",
	reconnaitre_rythme:      "#7C3AED",
	distinguer:              "#D97706",
	court_moyen_long:        "#0891B2",
	decision_orthographique: "#DC2626",
	comprendre:              "#16A34A",
	memoriser:               "#9333EA",
	percevoir:               "#EA580C",
	identifier:              "#0284C7",
	themes:                  "#BE185D",
};

const getLabel = (type: string) => TYPE_LABEL[type] ?? type.replace(/_/g, " ");
const getColor = (type: string) => TYPE_COLOR[type] ?? "#64748B";

/* ── Config visuelle des médailles ── */
const BADGE_CFG: Record<string, { icon: React.ReactNode; gradient: string; glow: string }> = {
	premier_pas: {
		icon:     <Play     size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #93C5FD 0%, #3B82F6 55%, #1D4ED8 100%)",
		glow:     "rgba(59,130,246,0.45)",
	},
	score_parfait: {
		icon:     <Trophy   size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)",
		glow:     "rgba(245,158,11,0.5)",
	},
	serie_3: {
		icon:     <Flame    size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #FCA5A5 0%, #EF4444 55%, #DC2626 100%)",
		glow:     "rgba(239,68,68,0.45)",
	},
	serie_7: {
		icon:     <Zap      size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #C4B5FD 0%, #7C3AED 55%, #5B21B6 100%)",
		glow:     "rgba(124,58,237,0.45)",
	},
	dix_sessions: {
		icon:     <Award    size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #6EE7B7 0%, #10B981 55%, #047857 100%)",
		glow:     "rgba(16,185,129,0.45)",
	},
	facile_maitrise: {
		icon:     <Star     size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #FEF08A 0%, #EAB308 45%, #92400E 100%)",
		glow:     "rgba(234,179,8,0.5)",
	},
	niveau_moyen: {
		icon:     <TrendingUp size={22} strokeWidth={2.2} color="white" />,
		gradient: "linear-gradient(145deg, #67E8F9 0%, #06B6D4 55%, #0E7490 100%)",
		glow:     "rgba(6,182,212,0.45)",
	},
};

interface StatType {
	type_exercice:  string;
	nb_sessions:    number;
	score_moyen:    number;
	meilleur_score: number;
}
interface Session {
	id:            number;
	score:         number;
	date_session:  string;
	titre:         string;
	type_exercice: string;
	niveau:        string;
}
interface Badge { id: string; emoji: string; titre: string; description: string; unlocked: boolean; }
interface Niveau { nom: string; niveau: number; prevXP: number; nextXP: number | null; xpPct: number; }

interface Stats {
	global:      { total_sessions: number; score_global: number; meilleur_score: number };
	parType:     StatType[];
	historique:  Session[];
	streak:      number;
	xp:          number;
	niveau:      Niveau;
	badges:      Badge[];
}

const fmtDate = (iso: string) =>
	new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const fmtTime = (iso: string) =>
	new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/* ── Anneau SVG ── */
const ScoreRing = ({ pct }: { pct: number }) => {
	const r = 72, cx = 92, circ = 2 * Math.PI * r;
	const val = Math.min(pct, 100);
	return (
		<svg width={184} height={184} viewBox="0 0 184 184" aria-hidden="true">
			<circle cx={cx} cy={cx} r={r + 10} fill="rgba(255,255,255,0.04)" />
			<circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={11} />
			<circle
				cx={cx} cy={cx} r={r}
				fill="none" stroke="white" strokeWidth={11} strokeLinecap="round"
				strokeDasharray={circ}
				strokeDashoffset={circ * (1 - val / 100)}
				transform={`rotate(-90 ${cx} ${cx})`}
				style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
			/>
			<text x={cx} y={cx} textAnchor="middle" fontSize="40" fontWeight="900"
				fill="white" fontFamily="inherit" dominantBaseline="middle">{val}</text>
		</svg>
	);
};

/* ── Calendrier de série (Duolingo style) ── */
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const StreakCalendar = ({ streak, historique }: { streak: number; historique: Session[] }) => {
	const actives = new Set(historique.map(s => s.date_session.slice(0, 10)));

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayDow = (today.getDay() + 6) % 7; // 0=Lun … 6=Dim

	// Début = lundi de la semaine d'il y a 3 semaines
	const startMonday = new Date(today);
	startMonday.setDate(today.getDate() - todayDow - 21);

	const cells: { iso: string; active: boolean; future: boolean }[] = [];
	for (let i = 0; i < 28; i++) {
		const d = new Date(startMonday);
		d.setDate(startMonday.getDate() + i);
		const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		cells.push({ iso, active: actives.has(iso), future: d > today });
	}

	return (
		<div className="sp2-streak-card">
			<div className="sp2-streak-top">
				<div className="sp2-streak-flame-wrap">
					<Flame size={26} strokeWidth={2} aria-hidden="true" />
					<div>
						<span className="sp2-streak-num">{streak}</span>
						<span className="sp2-streak-unit"> j.</span>
					</div>
				</div>
				<div className="sp2-streak-info">
					<p className="sp2-streak-title">Série en cours</p>
					<p className="sp2-streak-sub">
						{streak === 0
							? "Faites un exercice pour démarrer votre série !"
							: streak === 1
							? "Revenez demain pour continuer !"
							: `${streak} jours consécutifs — continuez !`}
					</p>
				</div>
			</div>

			<div className="sp2-streak-grid">
				{DAY_LABELS.map((d, i) => (
					<span key={i} className="sp2-streak-dlabel">{d}</span>
				))}
				{cells.map((c, i) => (
					<div
						key={i}
						className={[
							"sp2-streak-dot",
							c.active  ? "sp2-streak-dot--on"     : "",
							c.future  ? "sp2-streak-dot--future" : "",
						].join(" ").trim()}
						aria-label={c.active ? "Exercice fait" : c.future ? "À venir" : "Pas d'exercice"}
					/>
				))}
			</div>
		</div>
	);
};

const StatsPage = () => {
	const navigate              = useNavigate();
	const [stats, setStats]     = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);
	const [tab, setTab]         = useState<"progression" | "trophees">("progression");

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/api/stats`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => { if (!r.ok) throw new Error(); return r.json(); })
			.then(data => { setStats(data); setLoading(false); })
			.catch(() => setLoading(false));
	}, []);

	const isEmpty = !loading && (!stats || stats.global.total_sessions === 0);
	const unlockedCount = stats?.badges.filter(b => b.unlocked).length ?? 0;

	return (
		<div className="sp2-page">

			{/* ── HERO ── */}
			<header className="sp2-hero">
				<button type="button" className="sp2-back" onClick={() => navigate("/dashboard")} aria-label="Retour">
					<ChevronLeft size={20} strokeWidth={2.5} />
				</button>

				<div className="sp2-hero-inner">
					{loading ? (
						<p className="sp2-loading">Chargement…</p>
					) : isEmpty ? (
						<div className="sp2-hero-empty">
							<p className="sp2-hero-title">Mes progrès</p>
							<p className="sp2-hero-sub">Faites votre premier exercice pour voir vos stats ici.</p>
						</div>
					) : (
						<>
							<p className="sp2-hero-eyebrow">Score global</p>
							<ScoreRing pct={stats!.global.score_global ?? 0} />
							<div className="sp2-kpi-row">
								<div className="sp2-kpi">
									<TrendingUp size={15} strokeWidth={2} />
									<div>
										<p className="sp2-kpi-val">{stats!.global.total_sessions}</p>
										<p className="sp2-kpi-label">sessions</p>
									</div>
								</div>
								<div className="sp2-kpi-divider" />
								<div className="sp2-kpi">
									<Award size={15} strokeWidth={2} />
									<div>
										<p className="sp2-kpi-val">{Math.min(stats!.global.meilleur_score, 100)}%</p>
										<p className="sp2-kpi-label">meilleur</p>
									</div>
								</div>
								{stats!.streak > 0 && (
									<>
										<div className="sp2-kpi-divider" />
										<div className="sp2-kpi sp2-kpi--flame">
											<Flame size={15} strokeWidth={2} />
											<div>
												<p className="sp2-kpi-val">{stats!.streak}j</p>
												<p className="sp2-kpi-label">série</p>
											</div>
										</div>
									</>
								)}
							</div>
						</>
					)}
				</div>

				<div className="sp2-wave" aria-hidden="true">
					<svg viewBox="0 0 375 40" preserveAspectRatio="none">
						<path d="M0,20 C100,40 275,0 375,20 L375,40 L0,40 Z" fill="var(--color-bg)" />
					</svg>
				</div>
			</header>

			{/* ── CONTENU ── */}
			{!loading && !isEmpty && (
				<main className="sp2-scroll">

					{/* Onglets */}
					<div className="sp2-tabs" role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={tab === "progression"}
							className={`sp2-tab${tab === "progression" ? " sp2-tab--active" : ""}`}
							onClick={() => setTab("progression")}
						>
							Progression
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={tab === "trophees"}
							className={`sp2-tab${tab === "trophees" ? " sp2-tab--active" : ""}`}
							onClick={() => setTab("trophees")}
						>
							Trophées {unlockedCount > 0 && <span className="sp2-tab-badge">{unlockedCount}</span>}
						</button>
					</div>

					{/* ── Onglet Progression ── */}
					{tab === "progression" && (
						<>
							{/* Série / Streak calendar */}
							<section className="sp2-section">
								<h2 className="sp2-label">Assiduité</h2>
								<StreakCalendar streak={stats!.streak} historique={stats!.historique} />
							</section>

							{/* Par exercice */}
							{stats!.parType.length > 0 && (
								<section className="sp2-section">
									<h2 className="sp2-label">Par exercice</h2>
									<div className="sp2-cards-track">
										{stats!.parType.map(t => {
											const color = getColor(t.type_exercice);
											const pct   = Math.min(t.score_moyen, 100);
											return (
												<div key={t.type_exercice} className="sp2-type-card" style={{ "--tc": color, "--sp2-tc-bg": `${color}12`, "--sp2-tc-border": `${color}28` } as React.CSSProperties}>
													<p className="sp2-tc-nom">{getLabel(t.type_exercice)}</p>
													<div className="sp2-tc-arc" aria-hidden="true">
														<svg width="88" height="88" viewBox="0 0 88 88">
															<circle cx="44" cy="44" r="36" fill="none" stroke="#E2E8F0" strokeWidth="7"/>
															<circle
																cx="44" cy="44" r="36"
																fill="none" stroke={color} strokeWidth="7"
																strokeLinecap="round"
																strokeDasharray={2 * Math.PI * 36}
																strokeDashoffset={2 * Math.PI * 36 * (1 - pct / 100)}
																transform="rotate(-90 44 44)"
															/>
														</svg>
														<p className="sp2-tc-score" style={{ color }}>{pct}%</p>
													</div>
													<p className="sp2-tc-meta">{t.nb_sessions} session{t.nb_sessions > 1 ? "s" : ""}</p>
												</div>
											);
										})}
									</div>
								</section>
							)}

							{/* Insights */}
							{stats!.parType.length >= 2 && (
								<div className="sp2-insights">
									<div className="sp2-insight sp2-insight--ok">
										<Target size={18} strokeWidth={2} color="#16A34A" />
										<div>
											<p className="sp2-insight-label">Point fort</p>
											<p className="sp2-insight-val">{getLabel(stats!.parType[0].type_exercice)}</p>
										</div>
									</div>
									<div className="sp2-insight sp2-insight--ko">
										<Target size={18} strokeWidth={2} color="#D97706" />
										<div>
											<p className="sp2-insight-label">À travailler</p>
											<p className="sp2-insight-val">{getLabel(stats!.parType[stats!.parType.length - 1].type_exercice)}</p>
										</div>
									</div>
								</div>
							)}

							{/* Sessions récentes */}
							{stats!.historique.length > 0 && (
								<section className="sp2-section">
									<h2 className="sp2-label">Sessions récentes</h2>
									<ol className="sp2-feed">
										{stats!.historique.map(s => {
											const color = getColor(s.type_exercice);
											const pct   = Math.min(s.score, 100);
											return (
												<li key={s.id} className="sp2-feed-item" style={{ "--sp2-pct": `${pct}%`, "--sp2-color": color } as React.CSSProperties}>
													<div className="sp2-feed-score" style={{ background: color }}>
														{pct}%
													</div>
													<div className="sp2-feed-body">
														<p className="sp2-feed-titre">{s.titre}</p>
														<div className="sp2-feed-meta">
															<span className={`badge badge--${s.niveau}`}>{s.niveau}</span>
															<span className="sp2-feed-date">{fmtDate(s.date_session)} · {fmtTime(s.date_session)}</span>
														</div>
													</div>
												</li>
											);
										})}
									</ol>
								</section>
							)}
						</>
					)}

					{/* ── Onglet Trophées ── */}
					{tab === "trophees" && (
						<section className="sp2-section">
							<div className="sp2-trophy-header">
								<h2 className="sp2-label">Mes trophées</h2>
								<span className="sp2-trophy-count">{unlockedCount} / {stats!.badges.length} débloqués</span>
							</div>

							<div className="sp2-trophy-grid">
								{stats!.badges.map(b => {
									const cfg = BADGE_CFG[b.id];
									const on  = b.unlocked;
									return (
										<div
											key={b.id}
											className={`sp2-trophy-item${on ? " sp2-trophy-item--on" : " sp2-trophy-item--off"}`}
										>
											<div
												className="sp2-trophy-circle"
												style={on ? {
													background: cfg?.gradient ?? "#94A3B8",
													boxShadow: `0 8px 24px ${cfg?.glow ?? "rgba(0,0,0,0.15)"}`,
												} : {}}
											>
												{cfg?.icon}
											</div>
											<p className="sp2-trophy-name">{b.titre}</p>
											<p className="sp2-trophy-desc">{b.description}</p>
											{!on && <span className="sp2-trophy-locked">Verrouillé</span>}
										</div>
									);
								})}
							</div>
						</section>
					)}
				</main>
			)}

			{isEmpty && (
				<div className="sp2-empty">
					<TrendingUp size={48} color="#CBD5E1" strokeWidth={1.5} />
					<p>Aucune session pour l'instant</p>
					<button type="button" className="rs-btn rs-btn--primary" style={{ background: "#0D9488", maxWidth: 260 }}
						onClick={() => navigate("/parcours")}>
						Commencer un exercice
					</button>
				</div>
			)}
		</div>
	);
};

export default StatsPage;
