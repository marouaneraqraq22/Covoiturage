import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Clock, Car, Trash2, ChevronDown, ChevronUp, Check, X, User, Phone } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const MesTrajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trajetToDelete, setTrajetToDelete] = useState(null);
  const [expandedTrajetId, setExpandedTrajetId] = useState(null);
  const [reservations, setReservations] = useState({});
  const [loadingReservations, setLoadingReservations] = useState({});
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchMyTrajets();
  }, []);

  const fetchMyTrajets = async () => {
    try {
      const res = await api.get('/trajets/me');
      setTrajets(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
      showError("Impossible de charger vos annonces.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (trajetId) => {
    setTrajetToDelete(trajetId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!trajetToDelete) return;
    
    try {
      await api.delete(`/trajets/${trajetToDelete}`);
      showSuccess("Trajet supprimé avec succès !");
      setTrajets(trajets.filter(t => t.id !== trajetToDelete));
    } catch (error) {
      const errorMsg = typeof error.response?.data === 'string' 
        ? error.response.data 
        : (error.response?.data?.message || "Erreur lors de la suppression du trajet.");
      showError(errorMsg);
    } finally {
      setDeleteModalOpen(false);
      setTrajetToDelete(null);
    }
  };

  const toggleReservations = async (trajetId) => {
    if (expandedTrajetId === trajetId) {
      setExpandedTrajetId(null);
      return;
    }

    setExpandedTrajetId(trajetId);
    
    // Si on n'a pas encore chargé les réservations pour ce trajet
    if (!reservations[trajetId]) {
      setLoadingReservations(prev => ({...prev, [trajetId]: true}));
      try {
        const res = await api.get(`/reservations/trajet/${trajetId}/demandes`);
        setReservations(prev => ({...prev, [trajetId]: res.data}));
      } catch (error) {
        showError("Erreur lors du chargement des demandes.");
      } finally {
        setLoadingReservations(prev => ({...prev, [trajetId]: false}));
      }
    }
  };

  const handleActionReservation = async (trajetId, reservationId, action) => {
    try {
      const res = await api.put(`/reservations/${reservationId}/${action}`);
      showSuccess(`Réservation ${action === 'accepter' ? 'acceptée' : 'refusée'} avec succès.`);
      
      // Mettre à jour l'état des réservations localement
      const newStatut = action === 'accepter' ? 'CONFIRMED' : 'REJECTED';
      setReservations(prev => ({
        ...prev,
        [trajetId]: prev[trajetId].map(r => r.id === reservationId ? { ...r, statut: newStatut } : r)
      }));

      // Si acceptée, mettre à jour les places disponibles localement (décrémenter)
      if (action === 'accepter') {
        setTrajets(trajets.map(t => 
          t.id === trajetId ? { ...t, placesDisponibles: t.placesDisponibles - 1 } : t
        ));
      }
    } catch (error) {
      console.error("DEBUG ERROR FRONTAL:", error);
      let errorMsg = "Erreur JS ou Serveur.";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') errorMsg = "Serveur: " + error.response.data;
        else if (error.response.data.message) errorMsg = "Serveur: " + error.response.data.message;
        else if (error.response.data.error) errorMsg = "Serveur (500): " + error.response.data.error;
      } else if (error.message) {
        errorMsg = "Client JS: " + error.message;
      }
      showError(errorMsg);
    }
  };

  const MyTrajetCard = ({ trajet }) => (
    <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group border border-slate-100">
      <div className={`absolute top-0 left-0 text-white px-3 py-1 rounded-br-xl text-xs font-bold tracking-wider shadow-sm z-10 ${trajet.typeTrajet === 'INTRA_CASABLANCA' ? 'bg-purple-600' : 'bg-blue-600'}`}>
        {trajet.typeTrajet === 'INTRA_CASABLANCA' ? '📍 INTRA-CASA' : '🚗 VILLE À VILLE'}
      </div>
      <div className="absolute top-0 right-0 bg-slate-100 text-slate-700 px-4 py-1.5 rounded-bl-xl font-bold tracking-wide shadow-sm z-10 border-b border-l border-slate-200">
        {trajet.dateDepart}
      </div>
      
      <div className="flex flex-col h-full mt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col gap-1 w-full relative">
            <div className="flex items-center gap-3 relative z-10">
              <span className="font-bold text-slate-800 text-lg">{trajet.heureDepart}</span>
              <span className="font-medium text-slate-700 flex-1">{trajet.villeDepart}</span>
            </div>
            
            <div className="absolute left-10 top-6 bottom-6 w-0.5 bg-slate-200 z-0 hidden md:block"></div>
            
            <div className="flex items-center gap-3 relative z-10 mt-4">
              <span className="font-bold text-slate-500 text-sm">Fin</span>
              <span className="font-medium text-slate-700 flex-1">{trajet.villeArrivee}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
              <Users className="w-4 h-4 text-primary-500" />
              <span className="font-medium">{trajet.placesDisponibles} place(s)</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium">{trajet.prix} MAD</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => toggleReservations(trajet.id)}
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all border ${expandedTrajetId === trajet.id ? 'bg-primary-50 text-primary-600 border-primary-200' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50 border-slate-200'}`}
              title="Voir les demandes"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Demandes</span>
              {expandedTrajetId === trajet.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => openDeleteModal(trajet.id)}
              className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all border border-red-100 hover:border-red-500"
              title="Supprimer cette annonce"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          </div>
        </div>

        {/* Section des demandes (Expanded) */}
        {expandedTrajetId === trajet.id && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-up">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" /> Passagers intéressés
            </h4>
            
            {loadingReservations[trajet.id] ? (
              <div className="text-center py-4 text-sm text-slate-500">Chargement...</div>
            ) : !reservations[trajet.id] || reservations[trajet.id].length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500 bg-slate-50 rounded-lg">Aucune demande pour l'instant.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {reservations[trajet.id].map(resa => (
                  <div key={resa.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {resa.passager?.nom?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{resa.passager?.nom}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          Statut: 
                          <span className={`font-semibold ${resa.statut === 'CONFIRMED' ? 'text-green-600' : resa.statut === 'REJECTED' ? 'text-red-500' : 'text-orange-500'}`}>
                            {resa.statut === 'CONFIRMED' ? 'Acceptée' : resa.statut === 'REJECTED' ? 'Refusée' : 'En attente'}
                          </span>
                        </p>
                        {resa.passager?.telephone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {resa.passager.telephone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {resa.statut === 'PENDING' && (
                      <div className="flex gap-2 self-end sm:self-auto">
                        <button 
                          onClick={() => handleActionReservation(trajet.id, resa.id, 'refuser')}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors tooltip"
                          title="Refuser"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleActionReservation(trajet.id, resa.id, 'accepter')}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors tooltip"
                          title="Accepter"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 drop-shadow-sm flex items-center gap-3">
            <Car className="w-8 h-8 text-primary-600" /> Mes Annonces
          </h1>
          <p className="text-slate-500 mt-2">Gérez les trajets que vous avez publiés en tant que conducteur.</p>
        </div>
        <Link to="/proposer" className="btn-primary py-2.5 px-6 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5">
          + Publier un trajet
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : trajets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {trajets.map(trajet => (
            <MyTrajetCard key={trajet.id} trajet={trajet} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
          <Car className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune annonce publiée</h3>
          <p className="text-slate-500 mb-6">Vous n'avez pas encore proposé de trajet. Partagez la route dès maintenant !</p>
          <Link to="/proposer" className="btn-primary py-2 px-6 inline-block">
            Proposer mon premier trajet
          </Link>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Supprimer l'annonce ?</h3>
              <p className="text-slate-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement ce trajet ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setTrajetToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                >
                  Oui, supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesTrajets;
