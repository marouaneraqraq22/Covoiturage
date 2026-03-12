import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Calendar, Clock, DollarSign, Users } from 'lucide-react';

const ProposerTrajet = () => {
  const [formData, setFormData] = useState({
    villeDepart: '',
    villeArrivee: '',
    dateDepart: '',
    heureDepart: '',
    placesDisponibles: 3,
    prix: 50
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/trajets', formData);
      alert('Votre trajet a été publié avec succès !');
      navigate('/');
    } catch (error) {
      console.error("Erreur de publication:", error);
      alert("Erreur lors de la publication du trajet.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-card rounded-2xl overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-primary-900 via-primary-700 to-primary-600 px-8 py-8 text-white text-center relative overflow-hidden">
          {/* Abstract background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <h1 className="text-3xl font-extrabold relative z-10 drop-shadow-sm">Proposer un nouveau trajet</h1>
          <p className="text-primary-100 mt-2 relative z-10 font-medium">Partagez vos frais de route en bonne compagnie</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ville de départ</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input type="text" name="villeDepart" required className="input-field pl-10" placeholder="Ex: Casablanca" value={formData.villeDepart} onChange={handleChange} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ville d'arrivée</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input type="text" name="villeArrivee" required className="input-field pl-10" placeholder="Ex: Rabat" value={formData.villeArrivee} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <input type="date" name="dateDepart" required className="input-field pl-10" value={formData.dateDepart} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heure de départ</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
                <input type="time" name="heureDepart" required className="input-field pl-10" value={formData.heureDepart} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Places disponibles</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Users className="h-5 w-5" />
                </div>
                <input type="number" name="placesDisponibles" min="1" max="8" required className="input-field pl-10" value={formData.placesDisponibles} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix par passager (MAD)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <input type="number" name="prix" min="0" required className="input-field pl-10" value={formData.prix} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-8">
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-500/30 transform hover:scale-[1.02] transition-all">
              {loading ? 'Publication en cours...' : 'Publier le trajet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposerTrajet;
