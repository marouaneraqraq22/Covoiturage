import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Ticket, Calendar, MapPin, Clock, Phone, XCircle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  const handleAnnuler = async (reservationId) => {
    try {
      const res = await api.put(`/reservations/${reservationId}/annuler`);
      showSuccess(res.data);
      setReservations(reservations.map(r => r.id === reservationId ? { ...r, statut: 'CANCELED' } : r));
    } catch (error) {
      const errorMsg = typeof error.response?.data === 'string' 
        ? error.response.data 
        : "Erreur lors de l'annulation.";
      showError(errorMsg);
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/reservations/mes-reservations');
        setReservations(res.data);
      } catch (error) {
        console.error("Erreur chargement réservations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Chargement de vos réservations...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Mes Réservations</h1>
      <p className="text-slate-500 mb-8">Consultez et suivez l'historique de vos trajets réservés.</p>

      {reservations.length === 0 ? (
        <div className="bg-white py-16 px-4 text-center rounded-2xl border border-slate-200 border-dashed">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Vous n'avez aucune réservation</h3>
          <p className="text-slate-500">Recherchez un trajet sur la page d'accueil pour commencer à voyager.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map(reservation => (
            <div key={reservation.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    reservation.statut === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    reservation.statut === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    reservation.statut === 'CANCELED' ? 'bg-slate-100 text-slate-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {reservation.statut === 'CANCELED' ? 'ANNULÉE' : reservation.statut}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">Réservation #{reservation.id}</span>
                </div>
                
                {/* Afficher le téléphone du conducteur si réservation confirmée */}
                {reservation.statut === 'CONFIRMED' && reservation.trajet.conducteur?.telephone && (
                  <a href={`tel:${reservation.trajet.conducteur.telephone}`} className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold border border-green-200 mb-3 w-fit">
                    <Phone className="w-4 h-4" />
                    Appeler le conducteur
                  </a>
                )}

                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  {reservation.trajet.villeDepart} <ArrowRight className="w-4 h-4 text-slate-400" /> {reservation.trajet.villeArrivee}
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {reservation.trajet.dateDepart}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {reservation.trajet.heureDepart}
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:pl-6 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                <span className="text-sm font-medium text-slate-500">Montant</span>
                <span className="text-2xl font-bold text-primary-600">{reservation.trajet.prix} MAD</span>
                
                {/* Bouton Annuler */}
                {(reservation.statut === 'PENDING' || reservation.statut === 'CONFIRMED') && (() => {
                  const departDateTime = new Date(`${reservation.trajet.dateDepart}T${reservation.trajet.heureDepart}`);
                  const diffHours = (departDateTime - new Date()) / (1000 * 60 * 60);
                  if (diffHours > 1) {
                    return (
                      <button 
                        onClick={() => handleAnnuler(reservation.id)}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors border border-red-200"
                      >
                        <XCircle className="w-4 h-4" /> Annuler
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant Helper local
const ArrowRight = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default MesReservations;
