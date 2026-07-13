import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";


const ExercicePage = () => {

  const { id } = useParams();
const [exercice, setExercice] = useState<any>(null);

useEffect(() => {
  fetch(`http://localhost:3000/api/exercices/${id}`)
    .then((res) => res.json())
    .then((data) => setExercice(data));
}, [id]);


if (!exercice) return <p>Chargement...</p>;

const handleSubmit = async (score: number) => {
  const token = localStorage.getItem("token");
  await fetch("http://localhost:3000/api/resultats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_utilisateur: 1,
      id_exercice: Number(id),
      score,
    }),
  });
  alert("Résultat enregistré !");
};


return (
  <div>
    <h1>{exercice.titre}</h1>
    <p>Niveau : {exercice.niveau}</p>
    <p>{exercice.description}</p>
    <audio controls src={exercice.audio_url} />
    <button onClick={() => handleSubmit(100)}>Terminer l'exercice</button>
  </div>
);

};

export default ExercicePage;
