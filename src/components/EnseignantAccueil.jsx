import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiBell, FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EnseignantAccueil.css";
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
const EnseignantAccueil = () => {
  // États
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("accueil");
  const navigate = useNavigate();
  const [grade, setGrade] = useState("Maître Assistant B");
  const [experience, setExperience] = useState("");
  const [encadrements, setEncadrements] = useState(0);
  const [publications, setPublications] = useState(0);
  const [seminaires, setSeminaires] = useState(0);
  const [memoiresEncadrement, setMemoiresEncadrement] = useState([]);
  const [memoiresPublication, setMemoiresPublication] = useState([]);
  const [statutPromotion, setStatutPromotion] = useState("non soumis");
  const [demandes, setDemandes] = useState([]);

  // Vérification de l'authentification
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  // Synchronisation du statut promotion et des demandes étudiantes
  // Dans EnseignantAccueil.js - Remplacez le useEffect qui commence à la ligne ~45 par ceci :

useEffect(() => {
  const update = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const demandesStockees = JSON.parse(localStorage.getItem("demandes") || "[]");
    
    // Statut promotion
    const maPromotion = demandesStockees.find(
      (d) => d.type === "promotion" && d.userId === user?.id
    );
    if (maPromotion) {
      setStatutPromotion(maPromotion.statut);
      localStorage.setItem("statutPromotion", maPromotion.statut);
    } else {
      setStatutPromotion("non soumis");
      localStorage.setItem("statutPromotion", "non soumis");
    }
    
    // Demandes étudiantes à valider - CORRECTION ICI
    const demandesEtudiantes = demandesStockees.filter((d) => d.statut === "En attente" && d.type === "etudiant");
    setDemandes(demandesEtudiantes);
  };
  
  update();
  
  // Écouter les changements dans localStorage
  const handleStorageChange = () => {
    update();
  };
  
  window.addEventListener("storage", handleStorageChange);
  
  // AJOUT : Écouter aussi les changements de vue
  if (view === "etudiants") {
    update();
  }
  
  return () => window.removeEventListener("storage", handleStorageChange);
}, [view]); // Garder seulement 'view' comme dépendance

  // Gestion des fichiers
  const handleFileChange = (e, setter, maxFiles) => {
    const files = Array.from(e.target.files);
    if (files.length !== maxFiles) {
      alert(`Vous devez télécharger exactement ${maxFiles} fichiers.`);
      return;
    }
    setter(files);
  };

  // Validation du formulaire
  const isFormValid = () => (
    experience > 0 &&
    encadrements > 0 &&
    publications > 0 &&
    seminaires > 0 &&
    memoiresEncadrement.length === encadrements &&
    memoiresPublication.length === publications
  );

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Déconnexion réussie");
    window.location.reload(); // <-- Ajoute ceci pour forcer la synchro
  };

  // Soumission de la promotion
  const handleSubmitPromotion = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const promotion = {
          id: Date.now(),
          userId: user.id,
          enseignant: { nom: user.nom, prenom: user.prenom, grade },
          grade,
          experience,
          encadrements,
          publications,
          seminaires,
          memoiresEncadrement: memoiresEncadrement.map((f) => f.name),
          memoiresPublication: memoiresPublication.map((f) => f.name),
          dateCreation: new Date().toISOString(),
          statut: "En attente",
          type: "promotion"
        };

        // Ajoute la promotion dans "demandes" (pour le jury)
        const demandes = JSON.parse(localStorage.getItem("demandes") || "[]");
        demandes.push(promotion);
        localStorage.setItem("demandes", JSON.stringify(demandes));

        setStatutPromotion("En attente");
        localStorage.setItem("statutPromotion", "En attente");

        toast.success("Demande de promotion soumise avec succès");
        setView("statut");

        // Réinitialisation du formulaire
        setExperience("");
        setEncadrements(0);
        setPublications(0);
        setSeminaires(0);
        setMemoiresEncadrement([]);
        setMemoiresPublication([]);
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        toast.error("Erreur lors de la soumission");
      }
    } else {
      toast.error("Veuillez remplir tous les champs correctement");
    }
  };

  // Gestion des demandes étudiantes
  const handleValiderDemande = (demandeId) => {
    const demandesActuelles = JSON.parse(localStorage.getItem("demandes") || "[]");
    const demandesMaj = demandesActuelles.map((demande) => {
      if (demande.id === demandeId) {
        return { ...demande, statut: "Validé", feedback: "Dossier validé" };
      }
      return demande;
    });

    localStorage.setItem("demandes", JSON.stringify(demandesMaj));
    window.dispatchEvent(new Event("storage"));
    setDemandes(demandesMaj.filter((d) => d.statut === "En attente" && d.type === "etudiant"));
    toast.success("Demande acceptée");
  };

  const handleRefuserDemande = (demandeId) => {
    const feedback = prompt("Motif du refus :");
    if (feedback) {
      const demandesActuelles = JSON.parse(localStorage.getItem("demandes") || "[]");
      const demandesMaj = demandesActuelles.map((demande) => {
        if (demande.id === demandeId) {
          return { ...demande, statut: "Refusé", feedback };
        }
        return demande;
      });

      localStorage.setItem("demandes", JSON.stringify(demandesMaj));
      window.dispatchEvent(new Event("storage"));
      setDemandes(demandesMaj.filter((d) => d.statut === "En attente" && d.type === "etudiant"));
      toast.success("Demande refusée");
    }
  };

  return (
    <div className="container">
      <ToastContainer />

      {/* Header */}
      <div className="welcome-header">
        <div className="welcome-message">Bienvenue au portail enseignant</div>
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

      {/* Menu latéral */}
      <div className="menu-lateral">
        <h2>Système de Promotion</h2>
        <button className={view === "accueil" ? "active" : ""} onClick={() => setView("accueil")}>
          Accueil
        </button>
        <button className={view === "promotion" ? "active" : ""} onClick={() => setView("promotion")}>
          Demande de Promotion
        </button>
        <button className={view === "statut" ? "active" : ""} onClick={() => setView("statut")}>
          Voir mon statut
        </button>
        <button className={view === "etudiants" ? "active" : ""} onClick={() => setView("etudiants")}>
          Demandes étudiantes
        </button>
      </div>

      {/* Contenu principal */}
      <div className="contenu">
        <div className="contenu-box">
          {view === "accueil" ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2>Tableau de bord</h2>
              <p>Bienvenue sur votre espace enseignant</p>
              
            </motion.div>
          ) : view === "promotion" ? (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h2>Soumettre une demande de promotion</h2>
              </motion.div>

              <form className="formulaire" onSubmit={handleSubmitPromotion}>
                <div className="form-group">
                  <label>Grade :</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="Maître Assistant B">Maître Assistant B</option>
                    <option value="Maître Assistant A">Maître Assistant A</option>
                    <option value="Professeur">Professeur</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Années d'expérience :</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val > 0 && val < 50) setExperience(val);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre d'encadrements :</label>
                  <input
                    type="number"
                    value={encadrements}
                    onChange={(e) => setEncadrements(parseInt(e.target.value, 10) || 0)}
                  />
                  <input type="file" multiple onChange={(e) => handleFileChange(e, setMemoiresEncadrement, encadrements)} />
                </div>

                <div className="form-group">
                  <label>Nombre de publications :</label>
                  <input
                    type="number"
                    value={publications}
                    onChange={(e) => setPublications(parseInt(e.target.value, 10) || 0)}
                  />
                  <input type="file" multiple onChange={(e) => handleFileChange(e, setMemoiresPublication, publications)} />
                </div>

                <div className="form-group">
                  <label>Nombre de séminaires pédagogiques :</label>
                  <input
                    type="number"
                    value={seminaires}
                    onChange={(e) => setSeminaires(parseInt(e.target.value, 10) || 0)}
                  />
                </div>

                <button type="submit" disabled={!isFormValid()} className={isFormValid() ? "valide" : "desactive"}>
                  Soumettre
                </button>
              </form>
            </>
          ) : view === "statut" ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2>État de la demande</h2>
              <p>
                Statut :{" "}
                {statutPromotion === "non soumis" ? (
                  <span className="statut-non-soumis">Vous n'avez pas encore soumis une demande</span>
                ) : (
                  <span className={`statut-${statutPromotion && statutPromotion.toLowerCase()}`}>{statutPromotion}</span>
                )}
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="demandes-container">
              <h2>Demandes des étudiants</h2>
              {demandes.length === 0 ? (
                <p>Aucune demande en attente</p>
              ) : (
                <div className="demandes-grid">
                  {demandes.map((demande) => (
                    <div key={demande.id} className="demande-card">
                      <h3>{demande.etudiantNom}</h3>
                      <div className="demande-details">
                        <p>
                          <strong>Filière :</strong> {demande.filiere}
                        </p>
                        <p>
                          <strong>Date de soumission :</strong> {new Date(demande.dateCreation).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Moyenne :</strong>{" "}
                          {(demande.moyennes.reduce((a, b) => a + Number(b), 0) / demande.moyennes.length).toFixed(2)}/20
                        </p>
                        <p>
                          <strong>Documents :</strong>
                        </p>
                        <ul>
                          {demande.files.map((file, index) => (
                            <li key={index}>
                              {file}
                              <button
                                type="button"
                                className="btn-view"
                                onClick={() => {
                                  const fileURL = `/uploads/${file}`;
                                  window.open(fileURL, "_blank");
                                }}
                              >
                                Afficher le document
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="actions">
                        <button onClick={() => handleValiderDemande(demande.id)} className="btn-success">
                          Accepter
                        </button>
                        <button onClick={() => handleRefuserDemande(demande.id)} className="btn-danger">
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnseignantAccueil;