import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom";



const Dashboard = () => {

const [exercices, setExercices] = useState([]);

useEffect(() => {
fetch("http://localhost:3000/api/exercices")
  .then((res) => res.json())
  .then((data) => setExercices(data));
}, []);

const navigate = useNavigate();

  return (
  <div>
    <h1>Dashboard</h1>
    {exercices.map((ex: any) => (
      <div key={ex.id} onClick={() => navigate(`/exercice/${ex.id}`)} style={{ cursor: "pointer" }}>
        <h2>{ex.titre}</h2>
        <p>{ex.niveau}</p>
      </div>
    ))}
  </div>
);


};

export default Dashboard;
