import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { API_URL } from "../config/api";
import { Mail, Lock, Eye, EyeOff, Sun, Moon, Headphones, User } from "lucide-react";

type Onglet = "connexion" | "inscription";

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_MDP = /^.{8,}$/; // au moins 8 caractères

const LoginPage = () => {
	const [onglet, setOnglet] = useState<Onglet>("connexion");
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();

	/* — Connexion */
	const [email, setEmail] = useState("");
	const [emailTouche, setEmailTouche] = useState(false);
	const [motDePasse, setMotDePasse] = useState("");
	const [voirMdp, setVoirMdp] = useState(false);
	const [erreurCo, setErreurCo] = useState("");
	const [chargeCo, setChargeCo] = useState(false);

	/* — Inscription */
	const [prenom, setPrenom] = useState("");
	const [nom, setNom] = useState("");
	const [emailIn, setEmailIn] = useState("");
	const [emailInTouche, setEmailInTouche] = useState(false);
	const [mdpIn, setMdpIn] = useState("");
	const [mdpInTouche, setMdpInTouche] = useState(false);
	const [mdpConf, setMdpConf] = useState("");
	const [mdpConfTouche, setMdpConfTouche] = useState(false);
	const [voirMdpIn, setVoirMdpIn] = useState(false);
	const [erreurIn, setErreurIn] = useState("");
	const [chargeIn, setChargeIn] = useState(false);
	const [succes, setSucces] = useState("");

	/* — Refs pour focus-management */
	const emailRef    = useRef<HTMLInputElement>(null);
	const emailInRef  = useRef<HTMLInputElement>(null);
	const mdpInRef    = useRef<HTMLInputElement>(null);
	const mdpConfRef  = useRef<HTMLInputElement>(null);

	/* — Dérivés de validation */
	const emailCoInvalide = emailTouche && !RE_EMAIL.test(email);
	const emailInInvalide = emailInTouche && !RE_EMAIL.test(emailIn);
	const mdpInInvalide = mdpInTouche && !RE_MDP.test(mdpIn);
	const mdpConfInvalide = mdpConfTouche && mdpConf !== mdpIn;

	const handleConnexion = async (e: React.FormEvent) => {
		e.preventDefault();
		setErreurCo("");
		if (!RE_EMAIL.test(email)) {
			setEmailTouche(true);
			emailRef.current?.focus();
			return;
		}
		setChargeCo(true);
		try {
			const res = await fetch(`${API_URL}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, mot_de_passe: motDePasse }),
			});
			const data = await res.json();
			if (res.ok) {
				localStorage.setItem("token", data.token);
				navigate("/dashboard");
			} else {
				setErreurCo(data.message || "Identifiants incorrects.");
			}
		} catch {
			setErreurCo("Impossible de contacter le serveur.");
		} finally {
			setChargeCo(false);
		}
	};

	const handleInscription = async (e: React.FormEvent) => {
		e.preventDefault();
		setErreurIn("");
		if (!RE_EMAIL.test(emailIn)) {
			setEmailInTouche(true);
			emailInRef.current?.focus();
			return;
		}
		if (!RE_MDP.test(mdpIn)) {
			setMdpInTouche(true);
			mdpInRef.current?.focus();
			return;
		}
		if (mdpIn !== mdpConf) {
			setMdpConfTouche(true);
			mdpConfRef.current?.focus();
			setErreurIn("Les mots de passe ne correspondent pas.");
			return;
		}
		setChargeIn(true);
		try {
			const res = await fetch(`${API_URL}/api/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prenom, nom, email: emailIn, mot_de_passe: mdpIn }),
			});
			const data = await res.json();
			if (res.ok) {
				setSucces("Compte créé ! Connectez-vous.");
				setOnglet("connexion");
				setEmail(emailIn);
			} else {
				setErreurIn(data.message || "Erreur lors de l'inscription.");
			}
		} catch {
			setErreurIn("Impossible de contacter le serveur.");
		} finally {
			setChargeIn(false);
		}
	};

	return (
		<main className="login-page">
			<a href="#main-form" className="skip-link">Aller au formulaire</a>

			{/* Anneaux décoratifs */}
			<div className="login-ring login-ring--1" aria-hidden="true" />
			<div className="login-ring login-ring--2" aria-hidden="true" />
			<div className="login-ring login-ring--3" aria-hidden="true" />

			{/* Toggle thème */}
			<button
				type="button"
				className="login-theme-btn"
				onClick={toggleTheme}
				aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
			>
				{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
			</button>

			{/* Carte */}
			<div className="login-card" id="main-form">
				{/* Marque */}
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

				{/* Onglets */}
				<div className="login-tabs" role="tablist">
					<button
						role="tab"
						aria-selected={onglet === "connexion"}
						className={`login-tab${onglet === "connexion" ? " login-tab--active" : ""}`}
						onClick={() => { setOnglet("connexion"); setErreurIn(""); setSucces(""); }}
					>
						Connexion
					</button>
					<button
						role="tab"
						aria-selected={onglet === "inscription"}
						className={`login-tab${onglet === "inscription" ? " login-tab--active" : ""}`}
						onClick={() => { setOnglet("inscription"); setErreurCo(""); setSucces(""); }}
					>
						Inscription
					</button>
					<div className={`login-tab-indicator${onglet === "inscription" ? " login-tab-indicator--right" : ""}`} />
				</div>

				{/* ── Connexion ── */}
				{onglet === "connexion" && (
					<form onSubmit={handleConnexion} noValidate>
						{succes && <div className="form-success" role="status">✓ {succes}</div>}
						{erreurCo && (
							<div role="alert" aria-live="assertive" className="form-error">
								<span aria-hidden="true">⚠</span> {erreurCo}
							</div>
						)}

						<div className="form-group">
							<label htmlFor="email" className="form-label">E-mail</label>
							<div className="form-input-wrap">
								<Mail size={15} className={`form-input-icon${emailCoInvalide ? " form-input-icon--error" : ""}`} aria-hidden="true" />
								<input id="email" type="email"
									ref={emailRef}
									className={`form-input form-input--icon${emailCoInvalide ? " form-input--error" : ""}`}
									placeholder="vous@exemple.com" value={email}
									onChange={(e) => setEmail(e.target.value)}
									onBlur={() => setEmailTouche(true)}
									autoComplete="email" required aria-required="true"
									aria-invalid={emailCoInvalide} />
							</div>
							{emailCoInvalide && <p className="form-field-error">Adresse e-mail invalide.</p>}
						</div>

						<div className="form-group">
							<div className="login-label-row">
								<label htmlFor="mot-de-passe" className="form-label">Mot de passe</label>
								<button type="button" className="login-forgot">Mot de passe oublié ?</button>
							</div>
							<div className="form-input-wrap">
								<Lock size={15} className="form-input-icon" aria-hidden="true" />
								<input id="mot-de-passe" type={voirMdp ? "text" : "password"}
									className="form-input form-input--icon form-input--icon-right"
									placeholder="••••••••" value={motDePasse}
									onChange={(e) => setMotDePasse(e.target.value)}
									autoComplete="current-password" required aria-required="true" />
								<button type="button" className="form-input-eye"
									onClick={() => setVoirMdp(v => !v)}
									aria-label={voirMdp ? "Masquer" : "Afficher"}>
									{voirMdp ? <EyeOff size={15} /> : <Eye size={15} />}
								</button>
							</div>
						</div>

						<button type="submit" className="btn-primary" disabled={chargeCo}>
							{chargeCo ? "Connexion…" : "Se connecter"}
						</button>
					</form>
				)}

				{/* ── Inscription ── */}
				{onglet === "inscription" && (
					<form onSubmit={handleInscription} noValidate>
						{erreurIn && (
							<div role="alert" aria-live="assertive" className="form-error">
								<span aria-hidden="true">⚠</span> {erreurIn}
							</div>
						)}

						<div className="login-name-row">
							<div className="form-group">
								<label htmlFor="prenom" className="form-label">Prénom</label>
								<div className="form-input-wrap">
									<User size={15} className="form-input-icon" aria-hidden="true" />
									<input id="prenom" type="text" className="form-input form-input--icon"
										placeholder="Marie" value={prenom}
										onChange={(e) => setPrenom(e.target.value)}
										autoComplete="given-name" required aria-required="true" />
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="nom" className="form-label">Nom</label>
								<div className="form-input-wrap">
									<input id="nom" type="text" className="form-input"
										placeholder="Dupont" value={nom}
										onChange={(e) => setNom(e.target.value)}
										autoComplete="family-name" required aria-required="true" />
								</div>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="email-in" className="form-label">E-mail</label>
							<div className="form-input-wrap">
								<Mail size={15} className={`form-input-icon${emailInInvalide ? " form-input-icon--error" : ""}`} aria-hidden="true" />
								<input id="email-in" type="email"
									ref={emailInRef}
									className={`form-input form-input--icon${emailInInvalide ? " form-input--error" : ""}`}
									placeholder="vous@exemple.com" value={emailIn}
									onChange={(e) => setEmailIn(e.target.value)}
									onBlur={() => setEmailInTouche(true)}
									autoComplete="email" required aria-required="true"
									aria-invalid={emailInInvalide} />
							</div>
							{emailInInvalide && <p className="form-field-error">Adresse e-mail invalide.</p>}
						</div>

						<div className="form-group">
							<label htmlFor="mdp-in" className="form-label">Mot de passe</label>
							<div className="form-input-wrap">
								<Lock size={15} className={`form-input-icon${mdpInInvalide ? " form-input-icon--error" : ""}`} aria-hidden="true" />
								<input id="mdp-in" type={voirMdpIn ? "text" : "password"}
									ref={mdpInRef}
									className={`form-input form-input--icon form-input--icon-right${mdpInInvalide ? " form-input--error" : ""}`}
									placeholder="8 caractères minimum" value={mdpIn}
									onChange={(e) => setMdpIn(e.target.value)}
									onBlur={() => setMdpInTouche(true)}
									autoComplete="new-password" required aria-required="true"
									aria-invalid={mdpInInvalide} />
								<button type="button" className="form-input-eye"
									onClick={() => setVoirMdpIn(v => !v)}
									aria-label={voirMdpIn ? "Masquer" : "Afficher"}>
									{voirMdpIn ? <EyeOff size={15} /> : <Eye size={15} />}
								</button>
							</div>
							{mdpInInvalide && <p className="form-field-error">Minimum 8 caractères.</p>}
						</div>

						<div className="form-group">
							<label htmlFor="mdp-conf" className="form-label">Confirmer le mot de passe</label>
							<div className="form-input-wrap">
								<Lock size={15} className={`form-input-icon${mdpConfInvalide ? " form-input-icon--error" : ""}`} aria-hidden="true" />
								<input id="mdp-conf" type={voirMdpIn ? "text" : "password"}
									ref={mdpConfRef}
									className={`form-input form-input--icon${mdpConfInvalide ? " form-input--error" : ""}`}
									placeholder="••••••••" value={mdpConf}
									onChange={(e) => setMdpConf(e.target.value)}
									onBlur={() => setMdpConfTouche(true)}
									autoComplete="new-password" required aria-required="true"
									aria-invalid={mdpConfInvalide} />
							</div>
							{mdpConfInvalide && <p className="form-field-error">Les mots de passe ne correspondent pas.</p>}
						</div>

						<button type="submit" className="btn-primary" disabled={chargeIn}>
							{chargeIn ? "Création…" : "Créer mon compte"}
						</button>
					</form>
				)}
			</div>
		</main>
	);
};

export default LoginPage;
