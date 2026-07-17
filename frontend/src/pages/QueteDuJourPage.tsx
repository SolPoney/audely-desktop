import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { Flame, ChevronRight, CheckCircle2, Lock } from "lucide-react";

interface ExerciceQuete {
	id: number;
	titre: string;
	niveau: string;
	type_exercice: string;
	nb_revisions: number;
}

const NIVEAU_COLOR: Record<string, string> = {
	facile: "#22c55e",
	moyen: "#f59e0b",
	difficile: "#ef4444",
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
			.then(r => r.json())
			.then(data => {
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
				<p className="loading-text">Chargement de votre quête…</p>
			</div>
		);
	}

	const pct = exercices.length > 0 ? Math.round((nbFaits / exercices.length) * 100) : 0;

	return (
		<div className="quete-page">
			{/* Header */}
			<div className="quete-header">
				<button type="button" className="btn-back" onClick={() => navigate("/dashboard")}>
					← Retour
				</button>
			</div>

			{/* Hero */}
			<div className="quete-hero">
				<div className="quete-hero-icon" aria-hidden="true">
					<Flame size={32} color="white" strokeWidth={2} />
				</div>
				<h1 className="quete-hero-title">Quête du jour</h1>
				<p className="quete-hero-sub">
					{complete
						? "Bravo ! Vous avez terminé votre quête du jour 🎉"
						: `${nbFaits} / ${exercices.length} exercices complétés`}
				</p>

				{/* Barre de progression */}
				<div className="quete-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
					<div className="quete-progress-fill" style={{ width: `${pct}%` }} />
				</div>
			</div>

			{/* Liste des exercices */}
			<div className="quete-list">
				{exercices.map((exo, i) => {
					const estFait = i < nbFaits;
					const estCourant = i === nbFaits && !complete;
					const estVerrouille = i > nbFaits && !complete;

					return (
						<button
							key={exo.id}
							type="button"
							className={`quete-item ${estFait ? "quete-item--fait" : ""} ${estCourant ? "quete-item--courant" : ""} ${estVerrouille ? "quete-item--locked" : ""}`}
							onClick={() => !estVerrouille && navigate(`/exercice/${exo.id}`)}
							disabled={estVerrouille}
						>
							<div className="quete-item-left">
								<div className="quete-item-num" style={{ background: estFait ? "#22c55e" : estCourant ? "#7c3aed" : "#e2e8f0" }}>
									{estFait
										? <CheckCircle2 size={18} color="white" strokeWidth={2.5} />
										: estVerrouille
										? <Lock size={16} color="#94a3b8" strokeWidth={2} />
										: <span style={{ color: "white", fontWeight: 800 }}>{i + 1}</span>
									}
								</div>
								<div className="quete-item-info">
									<p className="quete-item-titre">{exo.titre}</p>
									<div className="quete-item-meta">
										<span className="quete-item-niveau" style={{ color: NIVEAU_COLOR[exo.niveau] }}>
											{exo.niveau}
										</span>
										{exo.nb_revisions > 0 && (
											<span className="quete-item-revision">
												🔁 Révision #{exo.nb_revisions + 1}
											</span>
										)}
									</div>
								</div>
							</div>
							{!estVerrouille && !estFait && (
								<ChevronRight size={20} color="#94a3b8" strokeWidth={2} />
							)}
						</button>
					);
				})}
			</div>

			{complete && (
				<div className="quete-complete-banner">
					<p className="quete-complete-text">🏆 Quête du jour accomplie !</p>
					<p className="quete-complete-sub">Revenez demain pour de nouveaux exercices.</p>
					<button type="button" className="rythme-btn-noir" onClick={() => navigate("/dashboard")}>
						Retour au tableau de bord
					</button>
				</div>
			)}
		</div>
	);
};

export default QueteDuJourPage;
