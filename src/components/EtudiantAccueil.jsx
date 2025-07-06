import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiBell, FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EtudiantAccueil.css";
// Correction automatique des anciennes demandes avec "status" au lieu de "statut"
if (typeof window !== "undefined") {
  const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
  let changed = false;
  demandes.forEach(d => {
    if (d.status && !d.statut) {
      d.statut = d.status;
      delete d.status;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("demandes", JSON.stringify(demandes));
  }
}

const EtudiantAccueil = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("accueil");
  const navigate = useNavigate();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [statutDemande, setStatutDemande] = useState("non soumis");
  const [filiere, setFiliere] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [files, setFiles] = useState([]);
  const [moyennes, setMoyennes] = useState([]);
  const [demande, setDemande] = useState(null);
  const [niveau, setNiveau] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Récupère la demande de l'étudiant connecté à chaque navigation ou connexion
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
      return;
    }
    const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
    const userId = JSON.parse(user).id;
    const demandeTrouvee = demandes.find((d) => d.etudiantId === userId);
    if (demandeTrouvee) {
      setDemande(demandeTrouvee);
      setStatutDemande(demandeTrouvee.statut); // Correction ici
      setFeedbackMessage(demandeTrouvee.feedback || "");
    } else {
      setDemande(null);
      setStatutDemande("non soumis");
      setFeedbackMessage("");
    }
  }, [navigate]);

  // Recharge la demande à chaque fois que l'étudiant clique sur "Voir mon statut"
  useEffect(() => {
    if (view === "statut") {
      const user = localStorage.getItem("user");
      if (!user) return;
      const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
      const userId = JSON.parse(user).id;
      const demandeTrouvee = demandes.find((d) => d.etudiantId === userId);
      if (demandeTrouvee) {
        setDemande(demandeTrouvee);
        setStatutDemande(demandeTrouvee.statut); // Correction ici
        setFeedbackMessage(demandeTrouvee.feedback || "");
      } else {
        setDemande(null);
        setStatutDemande("non soumis");
        setFeedbackMessage("");
      }
    }
  }, [view]);
  // Dans EtudiantAccueil.js - Ajoutez cet useEffect supplémentaire après les useEffect existants :

// AJOUT : Écouter les changements de localStorage pour mise à jour temps réel
useEffect(() => {
  const handleStorageChange = () => {
    const user = localStorage.getItem("user");
    if (!user) return;
    
    const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
    const userId = JSON.parse(user).id;
    const demandeTrouvee = demandes.find((d) => d.etudiantId === userId);
    
    if (demandeTrouvee) {
      setDemande(demandeTrouvee);
      setStatutDemande(demandeTrouvee.statut);
      setFeedbackMessage(demandeTrouvee.feedback || "");
    } else {
      setDemande(null);
      setStatutDemande("non soumis");
      setFeedbackMessage("");
    }
  };
  
  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };

  const handleTextChange = (e, setState) => {
    const value = e.target.value;
    if (/^[A-Za-zÀ-ÿ\s'-]*$/.test(value)) {
      setState(value);
    }
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const requiredCount = niveau === "license" ? 3 : 5;
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];

    if (uploadedFiles.length !== requiredCount) {
      toast.error(`Vous devez télécharger exactement ${requiredCount} fichiers.`);
      return;
    }

    for (let file of uploadedFiles) {
      if (!validTypes.includes(file.type)) {
        toast.error("Les fichiers doivent être au format PDF ou JPG.");
        return;
      }
    }

    setFiles(uploadedFiles);
    setMoyennes(new Array(requiredCount).fill(""));
  };

  const handleMoyenneChange = (index, value) => {
    if (!isNaN(value) && value >= 0 && value <= 20) {
      const updatedMoyennes = [...moyennes];
      updatedMoyennes[index] = value;
      setMoyennes(updatedMoyennes);
    }
  };

  const isFormValid = () => {
    const requiredCount = niveau === "license" ? 3 : 5;
    return (
      filiere.trim() !== "" &&
      lieuNaissance.trim() !== "" &&
      dateNaissance.trim() !== "" &&
      niveau &&
      files.length === requiredCount &&
      moyennes.length === requiredCount &&
      moyennes.every((moy) => moy !== "" && moy >= 0 && moy <= 20)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const nouvelleDemande = {
          id: Date.now(),
          filiere,
          lieuNaissance,
          dateNaissance,
          niveau,
          moyennes,
          files: files.map((f) => f.name),
          statut: "En attente", // Correction ici
          type: "etudiant",     // Ajout ici
          etudiantId: user.id,
          etudiantNom: `${user.nom} ${user.prenom}`,
          dateCreation: new Date().toISOString(),
          feedback: "",
        };

        // Sauvegarde dans localStorage
        const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
        demandes.push(nouvelleDemande);
        localStorage.setItem("demandes", JSON.stringify(demandes));

        setDemande(nouvelleDemande);
        setStatutDemande("En attente");
        localStorage.setItem("statutDemande", "En attente");
        toast.success("Demande soumise avec succès");
        setView("statut");

        // Réinitialiser le formulaire
        setFiliere("");
        setLieuNaissance("");
        setDateNaissance("");
        setFiles([]);
        setMoyennes([]);
        setNiveau("");
        window.dispatchEvent(new Event("storage")); // Pour la synchro instantanée
      } catch (error) {
        toast.error("Erreur lors de la soumission de la demande.");
      }
    }
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <div className="welcome-header">
        <div className="welcome-message">Bienvenue au portail étudiant</div>
        <div className="actions">
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMoreVertical size={24} />
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => alert("Notifications")}>
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

      {/* Menu latéral */}
      <div className="menu-lateral">
        <h2>Système de Diplômes</h2>
        <button className={view === "accueil" ? "active" : ""} onClick={() => setView("accueil")}>
          Accueil
        </button>
        <button className={view === "demande" ? "active" : ""} onClick={() => setView("demande")}>
          Soumettre une demande
        </button>
        <button className={view === "statut" ? "active" : ""} onClick={() => setView("statut")}>
          Voir mon statut
        </button>
      </div>

      {/* Contenu principal */}
      <div className="contenu">
        <div className="contenu-box">
          {view === "accueil" ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2>Tableau de bord</h2>
              <p>Bienvenue sur votre espace étudiant</p>
            </motion.div>
          ) : view === "demande" ? (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h2>Soumettre une demande</h2>
              </motion.div>
              <form onSubmit={handleSubmit} className="formulaire">
                <div className="form-group">
                  <label>Filière :</label>
                  <input type="text" value={filiere} onChange={(e) => handleTextChange(e, setFiliere)} />
                </div>

                <div className="form-group">
                  <label>Lieu de naissance :</label>
                  <input type="text" value={lieuNaissance} onChange={(e) => handleTextChange(e, setLieuNaissance)} />
                </div>

                <div className="form-group">
                  <label>Date de naissance :</label>
                  <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Niveau d'études :</label>
                  <select
                    value={niveau}
                    onChange={(e) => {
                      setNiveau(e.target.value);
                      setFiles([]);
                      setMoyennes([]);
                    }}
                    required
                  >
                    <option value="">Sélectionnez un niveau</option>
                    <option value="license">License</option>
                    <option value="master">Master</option>
                  </select>
                </div>

                {niveau && (
                  <>
                    <div className="form-group">
                      <label>Documents (PDF ou JPG) - {niveau === "license" ? "3" : "5"} fichiers requis :</label>
                      <input type="file" multiple accept=".pdf,.jpg,.jpeg" onChange={handleFileChange} required />
                      {files.length > 0 && (
                        <div className="files-preview">
                          {files.map((file, index) => (
                            <div key={index} className="file-item">
                              {file.name}
                              <button
                                type="button"
                                className="btn-view"
                                onClick={() => {
                                  const fileURL = URL.createObjectURL(file);
                                  window.open(fileURL, "_blank");
                                }}
                              >
                                Afficher le document
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Moyennes annuelles :</label>
                      <div className="moyennes-grid">
                        {[...Array(niveau === "license" ? 3 : 5)].map((_, index) => (
                          <input
                            key={index}
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            placeholder={`Moyenne ${index + 1}`}
                            value={moyennes[index] || ""}
                            onChange={(e) => handleMoyenneChange(index, e.target.value)}
                            required
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={!isFormValid()} className={isFormValid() ? "valide" : "desactive"}>
                  Soumettre
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2>État de la demande</h2>
              {!demande || statutDemande === "non soumis" ? (
                <p className="statut-non-soumis">Vous n'avez pas encore soumis de demande</p>
              ) : (
                <div className="statut-details">
                  <p className={`statut-${statutDemande}`}>Statut : {statutDemande}</p>
                  {feedbackMessage && <p className="feedback-message">Retour du jury : {feedbackMessage}</p>}
                  <div className="demande-details">
                    <p>Date de soumission : {new Date(demande.dateCreation).toLocaleDateString()}</p>
                    <p>Filière : {demande.filiere}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EtudiantAccueil;