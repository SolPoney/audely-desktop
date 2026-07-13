import { useState } from "react";
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [motDePasse, setMotDePasse] = useState("");
		const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const response = await fetch("http://localhost:3000/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, mot_de_passe: motDePasse }),
		});

		const data = await response.json();

		if (response.ok) {
			localStorage.setItem("token", data.token);
			navigate("/dashboard");

			console.log("Connecté !");
		} else {
			console.error(data.message);
		}
	};


	return (
		<form onSubmit={handleSubmit}>
			<h1>Connexion</h1>
			<input
				type="email"
				placeholder="Identifiant"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type="password"
				placeholder="Mot de passe"
				value={motDePasse}
				onChange={(e) => setMotDePasse(e.target.value)}
			/>
			<button type="submit">Se connecter</button>
		</form>
	);
};

export default LoginPage;
