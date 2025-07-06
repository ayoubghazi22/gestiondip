import { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context";
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import EtudiantDashboard from "./components/EtudiantDashboard";
import EnseignantDashboard from "./components/EnseignantDashboard";
import EmployeurDashboard from "./components/EmployeurDashboard";
import JuryDashboard from "./components/JuryDashboard";
import EtudiantAccueil from "./components/EtudiantAccueil";
import EnseignantAccueil from "./components/EnseignantAccueil";
import { motion } from "framer-motion";
import EmployeurAccueil from "./components/EmployeurAccueil";
import './App.css';
import JuryAccueil from "./components/JuryAccueil";
const SESSION_DURATION = 5 * 60 * 1000; 
const WARNING_DURATION = 4 * 60 * 1000;

const LoginForm = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email.trim() && password.trim()) {
      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
      
      // Vérifier si l'utilisateur existe avec cet email et mot de passe
      const foundUser = storedUsers.find(user => {
        console.log("Vérification utilisateur :", user);
        return user.email === email.trim() && user.password === password.trim();
      });

      if (foundUser) {
        console.log("Utilisateur trouvé :", foundUser);
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        localStorage.setItem("sessionExpiration", Date.now() + SESSION_DURATION);
        
        console.log("Redirection vers :", `/${foundUser.role}`);
        window.location.href = `/${foundUser.role}/accueil`;
      } else {
        alert("Email ou mot de passe incorrect !");
      }
    } else {
      alert("Veuillez entrer un email et un mot de passe");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <MdEmail className="absolute left-3 top-3 text-gray-400" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="relative">
        <FaLock className="absolute left-3 top-3 text-gray-400" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Se connecter</button>
      <button onClick={switchToSignup} className="text-blue-500 hover:underline">Créer un compte</button>
    </form>
  );
};

const SignupForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "@gmail.com",
    password: "",
    role: "étudiant", // ✅ Assigner un rôle par défaut
  });

  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation pour nom et prénom (uniquement lettres, espaces et tirets)
    if (name === "nom" || name === "prenom") {
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s-]*$/.test(value)) return;
    }
  
    // Validation pour téléphone (uniquement chiffres, max 10)
    if (name === "telephone") {
      if (!/^\d{0,10}$/.test(value)) return;
    }
  
    // Validation pour email (s'assurer qu'il se termine par @gmail.com)
    if (name === "email") {
      if (!value.endsWith("@gmail.com") && !value.includes("@")) {
        setFormData((prev) => ({ ...prev, [name]: value + "@gmail.com" }));
      } else if (!value.endsWith("@gmail.com") && value.includes("@")) {
        const username = value.split("@")[0];
        setFormData((prev) => ({ ...prev, [name]: username + "@gmail.com" }));
        return;
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    // Pour les autres champs
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "role" ? value : value.trim(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation du mot de passe (au moins une lettre et un chiffre)
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password)) {
      alert("Le mot de passe doit contenir au moins une lettre et un chiffre !");
      return;
    }
    
    // Validation du téléphone (exactement 10 chiffres)
    if (!/^\d{10}$/.test(formData.telephone)) {
      alert("Le numéro de téléphone doit contenir exactement 10 chiffres !");
      return;
    }
    
    // Validation de l'email (@gmail.com)
    if (!formData.email.endsWith("@gmail.com")) {
      alert("L'email doit se terminer par @gmail.com !");
      return;
    }
    
    // Vérification des champs remplis
    if (!formData.nom || !formData.prenom || !formData.telephone || 
        !formData.email || !formData.password || !formData.role) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    // Vérification du rôle
    if (!formData.role) {
      formData.role = "étudiant";
    }

    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    if (storedUsers.some(user => user.email === formData.email)) {
      alert("Cet email est déjà utilisé !");
      return;
    }
    const newUser = { ...formData, id: Date.now() }; // Ajoute un id unique
storedUsers.push(newUser);
localStorage.setItem("users", JSON.stringify(storedUsers));
localStorage.setItem("user", JSON.stringify(newUser));
localStorage.setItem("sessionExpiration", Date.now() + SESSION_DURATION);

setUser(newUser);
window.location.href = `/${newUser.role}/accueil`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <FaUser className="absolute left-3 top-3 text-gray-400" />
        <input 
          type="text" 
          name="nom" 
          placeholder="Nom" 
          value={formData.nom}
          onChange={handleChange} 
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <div className="relative">
        <FaUser className="absolute left-3 top-3 text-gray-400" />
        <input 
          type="text" 
          name="prenom" 
          placeholder="Prénom" 
          value={formData.prenom}
          onChange={handleChange} 
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <div className="relative">
        <MdPhone className="absolute left-3 top-3 text-gray-400" />
        <input 
          type="tel" 
          name="telephone" 
          placeholder="Téléphone" 
          value={formData.telephone}
          onChange={handleChange} 
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <div className="relative">
        <MdEmail className="absolute left-3 top-3 text-gray-400" />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange} 
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <div className="relative">
        <FaLock className="absolute left-3 top-3 text-gray-400" />
        <input 
          type="password" 
          name="password" 
          placeholder="Mot de passe" 
          value={formData.password}
          onChange={handleChange} 
          className="pl-10 p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      <select 
        name="role" 
        value={formData.role}
        onChange={handleChange} 
        className="p-2 border rounded"
      >
        <option value="étudiant">Étudiant</option>
        <option value="enseignant">Enseignant</option>
        <option value="employeur">Employeur</option>
        <option value="jury">Jury</option>
      </select>
      <button type="submit" className="p-3 bg-green-500 text-white rounded hover:bg-green-600 transition">S'inscrire</button>
      <button onClick={switchToLogin} className="text-blue-500 hover:underline">Déjà un compte ? Se connecter</button>
    </form>
  );
};

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  

  return (
    <div className="auth-page-container">
      <div className="auth-form-container">
      <img
          src="/logo.png"
          alt="Logo"
          style={{ width: 120, display: "block", margin: "30px auto 20px" }}
        />
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isSignup ? "Inscription" : "Connexion"}
        </h2>
        {isSignup ? (
          <SignupForm switchToLogin={() => setIsSignup(false)} />
        ) : (
          <LoginForm switchToSignup={() => setIsSignup(true)} />
        )}
      </div>
    </div>
  );
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
    <Routes>
      {/* Redirige vers la page de connexion si l'utilisateur n'est pas connecté */}
      <Route path="/" element={<AuthPage />} />

      {/* Accès sécurisé après connexion */}
      {user ? (
        <>
          <Route path="/étudiant/accueil" element={<EtudiantAccueil />} />
          <Route path="/enseignant/accueil" element={<EnseignantAccueil />} />
          <Route path="/employeur/accueil" element={<EmployeurAccueil />} />
          <Route path="/jury/accueil" element={<JuryAccueil />} />
          
          {/* Redirige selon le rôle */}
          <Route path="/étudiant" element={<Navigate to="/étudiant/accueil" />} />
          <Route path="/enseignant" element={<Navigate to="/enseignant/accueil" />} />
          <Route path="/employeur" element={<Navigate to="/employeur/accueil" />} />
          <Route path="/jury" element={<Navigate to="/jury/dashboard" />} />
        </>
      ) : (
        // Si l'utilisateur essaie d'accéder à une autre page, il est redirigé vers "/"
        <Route path="*" element={<Navigate to="/" />} />
      )}
    </Routes>
  </Router>

  );
};

export default App;
