import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ExercicePage from "./pages/ExercicePage";
import ExercicesPage from "./pages/ExercicesPage";
import ParcoursPage from "./pages/ParcoursPage";
import ParcoursListePage from "./pages/ParcoursListePage";
import ExercicesCatPage from "./pages/ExercicesCatPage";
import StatsPage from "./pages/StatsPage";
import QueteDuJourPage from "./pages/QueteDuJourPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/exercices" element={<PrivateRoute><ExercicesPage /></PrivateRoute>} />
        <Route path="/exercice/:id" element={<PrivateRoute><ExercicePage /></PrivateRoute>} />
        <Route path="/parcours" element={<PrivateRoute><ParcoursPage /></PrivateRoute>} />
        <Route path="/parcours/:niveau" element={<PrivateRoute><ParcoursListePage /></PrivateRoute>} />
        <Route path="/exercices/categorie/:id" element={<PrivateRoute><ExercicesCatPage /></PrivateRoute>} />
        <Route path="/stats" element={<PrivateRoute><StatsPage /></PrivateRoute>} />
        <Route path="/quete" element={<PrivateRoute><QueteDuJourPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
