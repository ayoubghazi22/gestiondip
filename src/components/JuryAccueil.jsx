import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiBell, FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./JuryAccueil.css";

const JuryAccueil = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("accueil");
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
    const update = () => {
      const storedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
      setDemandes(storedDemandes);
    };
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Déconnexion réussie");
  };

  // Dans JuryAccueil.js - Remplacez les fonctions handleValiderDemande et handleRefuserDemande par :

const handleValiderDemande = (demandeId) => {
  const storedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
  const updatedDemandes = storedDemandes.map(demande => {
    if (demande.id === demandeId) {
      return { ...demande, statut: "Validé", feedback: "Demande validée par le jury" };
    }
    return demande;
  });
  
  // Mettre à jour le state ET le localStorage
  setDemandes(updatedDemandes);
  localStorage.setItem("demandes", JSON.stringify(updatedDemandes));
  
  // Déclencher l'événement storage pour synchroniser les autres interfaces
  window.dispatchEvent(new Event("storage"));
  
  toast.success("Demande validée avec succès");
};

const handleRefuserDemande = (demandeId) => {
  const feedback = prompt("Motif du refus :");
  if (feedback) {
    const storedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
    const updatedDemandes = storedDemandes.map(demande => {
      if (demande.id === demandeId) {
        return { ...demande, statut: "Refusé", feedback };
      }
      return demande;
    });
    
    // Mettre à jour le state ET le localStorage
    setDemandes(updatedDemandes);
    localStorage.setItem("demandes", JSON.stringify(updatedDemandes));
    
    // Déclencher l'événement storage pour synchroniser les autres interfaces
    window.dispatchEvent(new Event("storage"));
    
    toast.error("Demande refusée");
  }
};

  // Helpers pour compatibilité
  const getNom = (demande) =>
    demande.enseignant?.nom || "-";
  const getPrenom = (demande) =>
    demande.enseignant?.prenom || "-";
  const getGrade = (demande) =>
    demande.enseignant?.grade || demande.grade || "-";

  return (
    <div className="container">
      <ToastContainer />
      <div className="welcome-header">
        <div className="welcome-message">
          Bienvenue au portail jury
        </div>
        <div className="actions">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMoreVertical size={24} />
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => toast.info("Notifications")}>
                <FiBell size={18} />
                Notifications
              </button>
              <button onClick={handleLogout}>
                <FiLogOut size={18} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="menu-lateral">
        <h2>Système de Validation</h2>
        <button 
          className={view === "accueil" ? "active" : ""} 
          onClick={() => setView("accueil")}
        >
          Accueil
        </button>
        <button 
          className={view === "demandes" ? "active" : ""} 
          onClick={() => setView("demandes")}
        >
          Demandes en attente
        </button>
        <button 
          className={view === "historique" ? "active" : ""} 
          onClick={() => setView("historique")}
        >
          Historique
        </button>
      </div>

      <div className="contenu">
        <div className="contenu-box">
          {view === "accueil" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2>Tableau de bord</h2>
              <p>Bienvenue sur votre espace jury</p>
              <div className="statistics">
                <p>Demandes de promotion en attente : {demandes.filter(d => d.statut === "En attente" && d.type === "promotion").length}</p>
                <p>Demandes de promotion traitées : {demandes.filter(d => d.statut !== "En attente" && d.type === "promotion").length}</p>
              </div>
            </motion.div>
          ) : view === "demandes" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2>Demandes de promotion en attente</h2>
              <div className="table-container">
                {demandes.filter(d => d.statut === "En attente" && d.type === "promotion").length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandes
                        .filter(demande => demande.statut === "En attente" && demande.type === "promotion")
                        .map(demande => (
                          <tr key={demande.id}>
                            <td>{getNom(demande)}</td>
                            <td>{getPrenom(demande)}</td>
                            <td>{getGrade(demande)}</td>
                            <td className="actions-cell">
                              <button 
                                className="valide"
                                onClick={() => handleValiderDemande(demande.id)}
                              >
                                Valider
                              </button>
                              <button 
                                className="refuser"
                                onClick={() => handleRefuserDemande(demande.id)}
                              >
                                Refuser
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-message">Aucune demande de promotion en attente</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2>Historique des promotions</h2>
              <div className="table-container">
                {demandes.filter(d => d.statut !== "En attente" && d.type === "promotion").length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Grade</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandes
                        .filter(demande => demande.statut !== "En attente" && demande.type === "promotion")
                        .map(demande => (
                          <tr key={demande.id}>
                            <td>{getNom(demande)}</td>
                            <td>{getPrenom(demande)}</td>
                            <td>{getGrade(demande)}</td>
                            <td className={`statut-${demande.statut ? demande.statut.toLowerCase() : ""}`}>
                              {demande.statut}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-message">Aucune promotion traitée</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuryAccueil;