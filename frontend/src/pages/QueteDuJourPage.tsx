import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { Zap, CheckCircle2, Lock, ChevronRight, ArrowLeft } from "lucide-react";

interface ExerciceQuete {
	id: number;
	titre: string;
	niveau: string;
	type_exercice: string;
	nb_revisions: number;
}

const NIVEAU_COLOR: Record<string, string> = {
	facile:    "#16a34a",
	moyen:     "#d97706",
	difficile: "#dc2626",
};

const NIVEAU_LABEL: Record<string, string> = {
	facile:    "Facile",
	moyen:     "Moyen",
	difficile: "Difficile",
};

const QueteDuJourPage = () => {
	const navigate = useNavigate();
	const [exercices, setExercices] = useState<ExerciceQuete[]>([]);
	const [nbFaits, setNbFaits]     = useState(0);
	const [complete, setComplete]   = useState(false);
	const [loading, setLoading]     = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/api/quete-du-jour`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(r => r.ok ? r.json() : null)
			.then(data => {
				if (!data) { setLoading(false); return; }
				setExercices(data.exercices ?? []);
				setNbFaits(data.nbFaits ?? 0);
				setComplete(data.complete ?? false);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="quete-page">
				<p className="loading-text" aria-live="polite">Chargement de votre quête…</p>
			</div>
		);
	}

	if (exercices.length === 0) {
		return (
			<div className="quete-page">
				<div className="quete-back-btn-wrap">
					<button type="button" className="parcours-back-btn" onClick={() => navigate("/dashboard")} aria-label="Retour">
						<ArrowLeft size={20} strokeWidth={2.5} />
					</button>
				</div>
				<div className="quete-empty">
					<p className="quete-empty-icon">🌱</p>
					<p className="quete-empty-titre">Revenez demain !</p>
					<p className="quete-empty-sub">Votre prochaine quête vous attend.</p>
				</div>
			</div>
		);
	}

	const pct = Math.round((nbFaits / exercices.length) * 100);

	return (
		<div className="quete-page">

			{/* Bouton retour */}
			<div className="quete-back-btn-wrap">
				<button type="button" className="parcours-back-btn" onClick={() => navigate("/dashboard")} aria-label="Retour">
					<ArrowLeft size={20} strokeWidth={2.5} />
				</button>
			</div>

			{/* Hero */}
			<div className="quete-hero">
				<div className="quete-hero-icon" aria-hidden="true">
					<Zap size={30} color="white" strokeWidth={2.2} fill="rgba(255,255,255,0.3)" />
				</div>
				<h1 className="quete-hero-title">Quête du jour</h1>
				<p className="quete-hero-sub">
					{complete ? "Félicitations, quête accomplie !" : `${nbFaits} / ${exercices.length} exercices réalisés`}
				</p>

				{/* Barre de progression */}
				<div className="quete-pbar-wrap">
					<div
						className="quete-pbar"
						role="progressbar"
						aria-valuenow={pct}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Progression : ${pct}%`}
					>
						<div className="quete-pbar-fill" style={{ width: `${pct}%` }} />
					</div>
					<span className="quete-pbar-pct">{pct}%</span>
				</div>
			</div>

			{/* Liste */}
			<div className="quete-list">
				{exercices.map((exo, i) => {
					const estFait       = i < nbFaits;
					const estCourant    = i === nbFaits && !complete;
					const estVerrouille = i > nbFaits && !complete;

					return (
						<button
							key={exo.id}
							type="button"
							className={[
								"quete-item",
								estFait       ? "quete-item--fait"   : "",
								estCourant    ? "quete-item--courant" : "",
								estVerrouille ? "quete-item--locked"  : "",
							].join(" ").trim()}
							onClick={() => estCourant && navigate(`/exercice/${exo.id}`)}
							disabled={estVerrouille || estFait}
							aria-label={`${exo.titre} — ${NIVEAU_LABEL[exo.niveau] ?? exo.niveau}`}
						>
							{/* Badge */}
							<div className={[
								"quete-item-badge",
								estFait    ? "quete-item-badge--fait"    : "",
								estCourant ? "quete-item-badge--courant" : "",
							].join(" ").trim()}>
								{estFait
									? <CheckCircle2 size={20} color="white" strokeWidth={2.5} />
									: estVerrouille
									? <Lock size={16} color="#94a3b8" strokeWidth={2} />
									: <span className="quete-item-num">{i + 1}</span>
								}
							</div>

							{/* Corps */}
							<div className="quete-item-body">
								<p className="quete-item-titre">{exo.titre}</p>
								<div className="quete-item-meta">
									<span className="quete-item-niveau" style={{ color: NIVEAU_COLOR[exo.niveau] ?? NIVEAU_COLOR.facile }}>
										● {NIVEAU_LABEL[exo.niveau] ?? exo.niveau}
									</span>
									{exo.nb_revisions > 0 && (
										<span className="quete-item-revision">Révision</span>
									)}
								</div>
							</div>

							{/* Flèche directionnelle (item actif seulement) */}
							{estCourant && (
								<ChevronRight size={22} color="white" strokeWidth={2.5} className="quete-item-arrow" />
							)}
						</button>
					);
				})}
			</div>

			{/* Bannière succès */}
			{complete && (
				<div className="quete-success">
					<p className="quete-success-emoji">🏆</p>
					<p className="quete-success-titre">Quête accomplie !</p>
					<p className="quete-success-sub">Revenez demain pour de nouveaux exercices.</p>
					<button
						type="button"
						className="quete-success-btn"
						onClick={() => navigate("/dashboard")}
					>
						Retour au tableau de bord
					</button>
				</div>
			)}
		</div>
	);
};

export default QueteDuJourPage;
