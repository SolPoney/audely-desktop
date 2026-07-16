import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, RotateCcw, Home, Trophy, Zap, Heart } from "lucide-react";

interface Props {
	score: number;       // 0-100
	bonnes: number;
	total: number;
	onRejouer?: () => void;
}

/* ── Config par pallier ── */
const getTier = (score: number) => {
	if (score >= 90) return {
		bg:       "#064E3B",
		accent:   "#10B981",
		light:    "#D1FAE5",
		label:    "Parfait !",
		sublabel: "Score exceptionnel",
		message:  "Vous maîtrisez cet exercice à la perfection. Votre oreille est remarquable !",
		stars:    3,
		icon:     Trophy,
		confetti: true,
	};
	if (score >= 70) return {
		bg:       "#1E3A5F",
		accent:   "#3B82F6",
		light:    "#DBEAFE",
		label:    "Très bien !",
		sublabel: "Bonne performance",
		message:  "Belle maîtrise. Encore un petit effort pour atteindre la perfection.",
		stars:    2,
		icon:     Zap,
		confetti: true,
	};
	if (score >= 40) return {
		bg:       "#78350F",
		accent:   "#F59E0B",
		light:    "#FEF3C7",
		label:    "Pas mal !",
		sublabel: "En progression",
		message:  "Vous progressez bien. Réessayez pour améliorer votre score.",
		stars:    1,
		icon:     Heart,
		confetti: false,
	};
	return {
		bg:       "#450A0A",
		accent:   "#EF4444",
		light:    "#FEE2E2",
		label:    "Courage !",
		sublabel: "Continuez à vous entraîner",
		message:  "Chaque tentative vous fait progresser. Ne lâchez pas !",
		stars:    0,
		icon:     Heart,
		confetti: false,
	};
};

/* ── Confetti CSS ── */
const CONFETTI_COLORS = [
	"#10B981","#3B82F6","#F59E0B","#EC4899","#8B5CF6",
	"#14B8A6","#F97316","#06B6D4","#84CC16","#FBBF24",
];

const Confetti = () => (
	<div className="rs-confetti" aria-hidden="true">
		{Array.from({ length: 50 }).map((_, i) => {
			const color  = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
			const left   = Math.random() * 100;
			const delay  = Math.random() * 2;
			const dur    = 2.5 + Math.random() * 2;
			const size   = 6 + Math.random() * 8;
			const rotate = Math.random() * 360;
			return (
				<span
					key={i}
					className="rs-confetti-piece"
					style={{
						left:            `${left}%`,
						animationDelay:  `${delay}s`,
						animationDuration:`${dur}s`,
						width:           `${size}px`,
						height:          `${size}px`,
						background:      color,
						transform:       `rotate(${rotate}deg)`,
						borderRadius:    i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
					}}
				/>
			);
		})}
	</div>
);

/* ── Compte à rebours animé ── */
const CountUp = ({ target }: { target: number }) => {
	const [val, setVal] = useState(0);
	useEffect(() => {
		let current = 0;
		// Départ rapide, ralentit à l'approche de la cible
		const tick = () => {
			const remaining = target - current;
			const step = Math.max(1, Math.ceil(remaining * 0.08));
			current = Math.min(current + step, target);
			setVal(current);
			if (current < target) requestAnimationFrame(tick);
		};
		const raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [target]);
	return <>{val}</>;
};

/* ── Étoile animée ── */
const AnimatedStar = ({ on, delay }: { on: boolean; delay: number }) => {
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setVisible(true), delay);
		return () => clearTimeout(t);
	}, [delay]);
	return (
		<div
			className={`rs-star-wrap ${visible ? "rs-star-wrap--in" : ""}`}
			aria-hidden="true"
		>
			<Star
				size={36}
				strokeWidth={1.5}
				className={on ? "rs-star rs-star--on" : "rs-star rs-star--off"}
			/>
		</div>
	);
};

const ResultScreen = ({ score, bonnes, total, onRejouer }: Props) => {
	const navigate = useNavigate();
	const tier     = getTier(score);
	const Icon     = tier.icon;
	const [entered, setEntered] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setEntered(true), 50);
		return () => clearTimeout(t);
	}, []);

	return (
		<div className="rs-page">
			{/* ── Hero ── */}
			<div className="rs-hero" style={{ background: tier.bg }}>
				{tier.confetti && <Confetti />}

				{/* Icône */}
				<div
					className={`rs-icon-wrap ${entered ? "rs-icon-wrap--in" : ""}`}
					style={{ background: tier.accent }}
				>
					<Icon size={28} color="white" strokeWidth={2} />
				</div>

				{/* Label */}
				<p className={`rs-tier-label ${entered ? "rs-tier-label--in" : ""}`}>
					{tier.sublabel}
				</p>

				{/* Gros score */}
				<div className={`rs-score-wrap ${entered ? "rs-score-wrap--in" : ""}`}>
					<span className="rs-score-num" style={{ color: tier.accent }}>
						<CountUp target={score} />
					</span>
					<span className="rs-score-pct">%</span>
				</div>

				<p className="rs-detail">
					{bonnes} / {total} bonne{bonnes > 1 ? "s" : ""} réponse{bonnes > 1 ? "s" : ""}
				</p>

				{/* Étoiles */}
				<div className="rs-stars" aria-label={`${tier.stars} étoile${tier.stars > 1 ? "s" : ""} sur 3`}>
					{[1, 2, 3].map((n) => (
						<AnimatedStar key={n} on={n <= tier.stars} delay={400 + n * 150} />
					))}
				</div>

				{/* Vague */}
				<div className="rs-wave" aria-hidden="true">
					<svg viewBox="0 0 375 56" preserveAspectRatio="none">
						<path d="M0,28 C80,56 160,0 250,28 C310,48 350,16 375,28 L375,56 L0,56 Z" fill="white" />
					</svg>
				</div>
			</div>

			{/* ── Corps ── */}
			<div className="rs-body">
				<div
					className="rs-label-badge"
					style={{ background: tier.light, color: tier.bg }}
				>
					{tier.label}
				</div>

				<p className="rs-message">{tier.message}</p>

				<div className="rs-actions">
					{onRejouer && (
						<button
							type="button"
							className="rs-btn rs-btn--outline"
							onClick={onRejouer}
						>
							<RotateCcw size={16} strokeWidth={2.2} />
							Réessayer
						</button>
					)}
					<button
						type="button"
						className="rs-btn rs-btn--primary"
						style={{ background: tier.bg }}
						onClick={() => navigate("/dashboard")}
					>
						<Home size={16} strokeWidth={2.2} />
						Tableau de bord
					</button>
				</div>
			</div>
		</div>
	);
};

export default ResultScreen;
