import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	ChevronLeft, Flame, TrendingUp, Award, Target, Check, Zap,
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

const getLabel = (t: string) => TYPE_LABEL[t] ?? t.replace(/_/g, " ");
const getColor = (t: string) => TYPE_COLOR[t] ?? "#64748B";

const MILESTONES = [
	{ days: 3,   label: "Star",           icon: "🔥", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)",  color: "#B45309" },
	{ days: 5,   label: "Superstar",      icon: "🔥", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)",  color: "#B45309" },
	{ days: 7,   label: "Champion",       icon: "⚡", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.35)",  color: "#DC2626" },
	{ days: 14,  label: "Enflammé",       icon: "⚡", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.35)",  color: "#DC2626" },
	{ days: 31,  label: "Icône",          icon: "💜", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.35)", color: "#6D28D9" },
	{ days: 50,  label: "Éminence",       icon: "💜", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.35)", color: "#6D28D9" },
	{ days: 100, label: "Invincible",     icon: "🛡️", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.35)", color: "#047857" },
	{ days: 365, label: "Interstellaire", icon: "🌟", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.35)",  color: "#0E7490" },
];

interface StatType { type_exercice: string; nb_sessions: number; score_moyen: number; meilleur_score: number; }
interface Session  { id: number; score: number; date_session: string; titre: string; type_exercice: string; niveau: string; }
interface Niveau   { nom: string; niveau: number; prevXP: number; nextXP: number | null; xpPct: number; }
interface Stats {
	global:      { total_sessions: number; score_global: number; meilleur_score: number };
	parType:     StatType[];
	historique:  Session[];
	streak:      number;
	xp:          number;
	niveau:      Niveau;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/* ── Anneau SVG ── */
const ScoreRing = ({ pct }: { pct: number }) => {
	const r = 66, cx = 84, circ = 2 * Math.PI * r, val = Math.min(pct, 100);
	return (
		<svg width={168} height={168} viewBox="0 0 168 168" aria-hidden="true">
			{/* Halo de fond */}
			<circle cx={cx} cy={cx} r={r + 10} fill="rgba(255,255,255,0.04)" />
			{/* Track */}
			<circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={11} />
			{/* Progress */}
			<circle cx={cx} cy={cx} r={r} fill="none" stroke="white" strokeWidth={11} strokeLinecap="round"
				strokeDasharray={circ} strokeDashoffset={circ * (1 - val / 100)}
				transform={`rotate(-90 ${cx} ${cx})`}
				style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))" }} />
			{/* Score */}
			<text x={cx} y={cx - 7} textAnchor="middle" fontSize="40" fontWeight="900"
				fill="white" fontFamily="inherit" dominantBaseline="middle">{val}%</text>
			<text x={cx} y={cx + 18} textAnchor="middle" fontSize="10" fontWeight="600"
				fill="rgba(255,255,255,0.5)" fontFamily="inherit" letterSpacing="2">SCORE GLOBAL</text>
		</svg>
	);
};

/* ── Semaine streak ── */
const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const StreakWeek = ({ streak, historique }: { streak: number; historique: Session[] }) => {
	const actives = new Set(historique.map(s => s.date_session.slice(0, 10)));
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayDow = (today.getDay() + 6) % 7;

	const weekDays = WEEK_LABELS.map((label, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() - todayDow + i);
		const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		return { label, iso, active: actives.has(iso), isToday: i === todayDow, future: d > today };
	});

	const nextM = MILESTONES.find(m => m.days > streak);
	const pct   = nextM ? Math.min(Math.round((streak / nextM.days) * 100), 100) : 100;

	const msg =
		streak === 0 ? "Faites un exercice pour démarrer&nbsp;!" :
		streak < 3   ? "Continuez, vous y êtes presque&nbsp;!" :
		streak < 7   ? "Vous êtes en feu, ne lâchez rien&nbsp;!" :
		               "Prodigieux, continuez comme ça&nbsp;!";

	return (
		<div className="sw-card">
			{/* En-tête : flamme + message */}
			<div className="sw-top">
				<div className="sw-flame-block">
					<Flame size={30} className="sw-flame-icon" aria-hidden="true" />
					<span className="sw-streak-num">{streak}</span>
					<span className="sw-streak-unit">j</span>
				</div>
				<div className="sw-streak-info">
					<p className="sw-streak-msg" dangerouslySetInnerHTML={{ __html: msg }} />
					{nextM && (
						<p className="sw-next-milestone">
							Prochain&nbsp;: <strong>{nextM.days}j — {nextM.label}</strong>
						</p>
					)}
				</div>
			</div>

			{/* Barre de progression */}
			{nextM && (
				<div className="sw-progress-row">
					<div className="sw-progress-bar" role="progressbar" aria-label={`Progression vers le palier ${nextM.days} jours`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
						<div className="sw-progress-fill" style={{ width: `${pct}%` }} />
					</div>
					<span className="sw-progress-label">{streak}/{nextM.days}</span>
				</div>
			)}

			{/* Calendrier — 2 lignes séparées pour aligner le connecteur */}
			<div className="sw-calendar">
				<div className="sw-cal-labels">
					{weekDays.map((d, i) => (
						<span key={i} className={`sw-day-label${d.isToday ? " sw-day-label--today" : ""}`}>{d.label}</span>
					))}
				</div>
				<div className="sw-cal-circles">
					<div className="sw-connector" aria-hidden="true" />
					{weekDays.map((d, i) => (
						<div key={i} className={[
							"sw-circle",
							d.active            ? "sw-circle--on"     : "",
							d.isToday && !d.active ? "sw-circle--today"  : "",
							d.future            ? "sw-circle--future" : "",
						].filter(Boolean).join(" ")}>
							{d.active && <Check size={15} strokeWidth={3} color="white" />}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

/* ── Page ── */
const StatsPage = () => {
	const navigate              = useNavigate();
	const [stats, setStats]     = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/api/stats`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => { if (!r.ok) throw new Error(); return r.json(); })
			.then(data => { setStats(data); setLoading(false); })
			.catch(() => setLoading(false));
	}, []);

	const isEmpty = !loading && (!stats || stats.global.total_sessions === 0);

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
							<ScoreRing pct={stats!.global.score_global ?? 0} />
							<div className="sp2-kpi-row">
								<div className="sp2-kpi">
									<TrendingUp size={14} strokeWidth={2.2} />
									<div>
										<p className="sp2-kpi-val">{stats!.global.total_sessions}</p>
										<p className="sp2-kpi-label">Sessions</p>
									</div>
								</div>
								<div className="sp2-kpi-divider" />
								<div className="sp2-kpi">
									<Award size={14} strokeWidth={2.2} />
									<div>
										<p className="sp2-kpi-val">{Math.min(stats!.global.meilleur_score, 100)}%</p>
										<p className="sp2-kpi-label">Meilleur</p>
									</div>
								</div>
								{stats!.streak > 0 && <>
									<div className="sp2-kpi-divider" />
									<div className="sp2-kpi sp2-kpi--flame">
										<Flame size={14} strokeWidth={2.2} />
										<div>
											<p className="sp2-kpi-val">{stats!.streak}j</p>
											<p className="sp2-kpi-label">Série</p>
										</div>
									</div>
								</>}
								{stats!.xp > 0 && <>
									<div className="sp2-kpi-divider" />
									<div className="sp2-kpi sp2-kpi--xp">
										<Zap size={14} strokeWidth={2.2} />
										<div>
											<p className="sp2-kpi-val">{stats!.xp}</p>
											<p className="sp2-kpi-label">{stats!.niveau?.nom}</p>
										</div>
									</div>
								</>}
							</div>
						</>
					)}
				</div>

				<div className="sp2-wave" aria-hidden="true">
					<svg viewBox="0 0 375 48" preserveAspectRatio="none">
						<path d="M0,24 C60,48 120,8 180,24 C240,40 300,8 375,24 L375,48 L0,48 Z" fill="var(--color-bg)" />
					</svg>
				</div>
			</header>

			{/* ── CONTENU ── */}
			{!loading && !isEmpty && (
				<main className="sp2-scroll">

					{/* Assiduité */}
					<section className="sp2-section">
						<h2 className="sp2-label">Assiduité</h2>
						<StreakWeek streak={stats!.streak} historique={stats!.historique} />
					</section>

					{/* Paliers */}
					<section className="sp2-section">
						<h2 className="sp2-label">Paliers de série</h2>
						<div className="sp2-milestones">
							{MILESTONES.map(m => {
								const on = stats!.streak >= m.days;
								return (
									<div key={m.days}
										className={`sp2-ms-pill${on ? " sp2-ms-pill--on" : ""}`}
										style={on ? {
											"--ms-bg": m.bg,
											"--ms-border": m.border,
											"--ms-color": m.color,
										} as React.CSSProperties : {}}>
										<span className="sp2-ms-icon" aria-hidden="true">{m.icon}</span>
										<span className="sp2-ms-days">{m.days}j</span>
										<span className="sp2-ms-name">{m.label}</span>
									</div>
								);
							})}
						</div>
					</section>

					{/* Par type */}
					{stats!.parType.length > 0 && (
						<section className="sp2-section">
							<h2 className="sp2-label">Par type d'exercice</h2>
							<div className="sp2-cards-track">
								{stats!.parType.map(t => {
									const color = getColor(t.type_exercice);
									const pct   = Math.min(t.score_moyen, 100);
									const circ  = 2 * Math.PI * 20;
									return (
										<div key={t.type_exercice} className="sp2-type-card"
											style={{ "--tc": color } as React.CSSProperties}>
											<div className="sp2-tc-header">
												<p className="sp2-tc-nom">{getLabel(t.type_exercice)}</p>
												<p className="sp2-tc-meta">{t.nb_sessions}&nbsp;sess.</p>
											</div>
											<div className="sp2-tc-body">
												<svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
													<circle cx="26" cy="26" r="20" fill="none" stroke={`${color}22`} strokeWidth="5"/>
													<circle cx="26" cy="26" r="20" fill="none" stroke={color} strokeWidth="5"
														strokeLinecap="round"
														strokeDasharray={circ}
														strokeDashoffset={circ * (1 - pct / 100)}
														transform="rotate(-90 26 26)" />
												</svg>
												<p className="sp2-tc-score" style={{ color }}>{pct}%</p>
											</div>
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
								<Target size={17} strokeWidth={2.2} />
								<div>
									<p className="sp2-insight-label">Point fort</p>
									<p className="sp2-insight-val">{getLabel(stats!.parType[0].type_exercice)}</p>
								</div>
							</div>
							<div className="sp2-insight sp2-insight--ko">
								<Target size={17} strokeWidth={2.2} />
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
										<li key={s.id} className="sp2-feed-item">
										<div className="sp2-feed-score" style={{ background: `${color}18`, color }}>{pct}%</div>
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

				</main>
			)}

			{isEmpty && (
				<div className="sp2-empty">
					<TrendingUp size={48} color="#CBD5E1" strokeWidth={1.5} />
					<p>Aucune session pour l'instant</p>
					<button type="button" className="rs-btn rs-btn--primary"
						style={{ background: "#0D9488", maxWidth: 260 }}
						onClick={() => navigate("/parcours")}>
						Commencer un exercice
					</button>
				</div>
			)}
		</div>
	);
};

export default StatsPage;
