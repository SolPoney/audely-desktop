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

return (
  <div>
    <h1>{exercice.titre}</h1>
    <p>Niveau : {exercice.niveau}</p>
    <p>{exercice.description}</p>
    <audio controls src={exercice.audio_url} />
  </div>
);

};

export default ExercicePage;
