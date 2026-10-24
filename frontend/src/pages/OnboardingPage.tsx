import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Check } from "lucide-react";
import { API_URL } from "../config/api";

interface Objectif {
	valeur: number;
	label: string;
	sous: string;
}

const OBJECTIFS: Objectif[] = [
	{ valeur: 20, label: "Léger", sous: "~5 min par jour" },
	{ valeur: 30, label: "Régulier", sous: "~10 min par jour" },
	{ valeur: 50, label: "Soutenu", sous: "~15 min par jour" },
	{ valeur: 80, label: "Intensif", sous: "~20 min par jour" },
];

const OnboardingPage = () => {
	const navigate = useNavigate();
	const [choix, setChoix] = useState<number>(30);
	const [envoi, setEnvoi] = useState(false);
	const [erreur, setErreur] = useState("");

	const valider = async () => {
		setEnvoi(true);
		setErreur("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/api/utilisateur/onboarding`, {
				method: "PUT",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ objectif_quotidien_xp: choix }),
			});
			if (res.ok) {
				navigate("/dashboard");
			} else {
				setErreur("Impossible d'enregistrer votre choix. Réessayez.");
			}
		} catch {
			setErreur("Impossible de contacter le serveur.");
		} finally {
			setEnvoi(false);
		}
	};

	return (
		<main className="login-page">
			<div className="login-ring login-ring--1" aria-hidden="true" />
			<div className="login-ring login-ring--2" aria-hidden="true" />
			<div className="login-ring login-ring--3" aria-hidden="true" />

			<div className="login-card">
				<div className="login-brand">
					<div className="login-brand-icon">
						<Headphones size={22} strokeWidth={1.8} />
					</div>
					<div>
						<p className="login-brand-name">Au<span>de</span>ly</p>
						<p className="login-brand-tagline">Rééducation auditive</p>
					</div>
				</div>

				<div className="login-divider" />

				<h1 className="onb-titre">Quel rythme pour vous&nbsp;?</h1>
				<p className="onb-sous-titre">
					10 minutes par jour valent mieux qu'une heure le dimanche. Vous pourrez changer ce choix plus tard.
				</p>

				<div className="onb-choix-liste" role="radiogroup" aria-label="Objectif quotidien">
					{OBJECTIFS.map((o) => (
						<button
							key={o.valeur}
							type="button"
							role="radio"
							aria-checked={choix === o.valeur}
							className={`onb-choix-card${choix === o.valeur ? " onb-choix-card--select" : ""}`}
							onClick={() => setChoix(o.valeur)}
						>
							<span className="onb-choix-texte">
								<span className="onb-choix-label">{o.label}</span>
								<span className="onb-choix-sous">{o.sous}</span>
							</span>
							{choix === o.valeur && <Check size={18} strokeWidth={2.5} aria-hidden="true" />}
						</button>
					))}
				</div>

				{erreur && (
					<div role="alert" aria-live="assertive" className="form-error">
						<span aria-hidden="true">⚠</span> {erreur}
					</div>
				)}

				<button type="button" className="btn-primary" onClick={valider} disabled={envoi}>
					{envoi ? "Enregistrement…" : "Commencer"}
				</button>
			</div>
		</main>
	);
};

export default OnboardingPage;
