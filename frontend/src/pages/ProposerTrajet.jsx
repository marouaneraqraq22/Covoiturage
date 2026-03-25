import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { MOROCCAN_CITIES, CASABLANCA_NEIGHBORHOODS } from '../utils/constants';
import CustomSelect from '../components/CustomSelect';

const ProposerTrajet = () => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    typeTrajet: 'VILLE_A_VILLE',
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
      showSuccess('Votre trajet a été publié avec succès !');
      navigate('/');
    } catch (error) {
      console.error("Erreur de publication:", error);
      showError("Erreur lors de la publication du trajet.");
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
          <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-md mx-auto mb-8 cursor-pointer">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, typeTrajet: 'VILLE_A_VILLE', villeDepart: '', villeArrivee: '' })}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${formData.typeTrajet === 'VILLE_A_VILLE' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Ville à ville
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, typeTrajet: 'INTRA_CASABLANCA', villeDepart: '', villeArrivee: '' })}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${formData.typeTrajet === 'INTRA_CASABLANCA' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Intra-Casablanca
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {formData.typeTrajet === 'VILLE_A_VILLE' ? 'Ville de départ' : 'Quartier de départ'}  
              </label>
              <CustomSelect
                value={formData.villeDepart}
                onChange={(val) => setFormData({...formData, villeDepart: val})}
                placeholder={formData.typeTrajet === 'VILLE_A_VILLE' ? 'Sélectionner une ville' : 'Sélectionner un quartier'}
                options={formData.typeTrajet === 'VILLE_A_VILLE' ? MOROCCAN_CITIES : CASABLANCA_NEIGHBORHOODS}
                icon={<MapPin className="h-5 w-5" />}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {formData.typeTrajet === 'VILLE_A_VILLE' ? "Ville d'arrivée" : "Quartier d'arrivée"}
              </label>
              <CustomSelect
                value={formData.villeArrivee}
                onChange={(val) => setFormData({...formData, villeArrivee: val})}
                placeholder={formData.typeTrajet === 'VILLE_A_VILLE' ? 'Sélectionner une ville' : 'Sélectionner un quartier'}
                options={formData.typeTrajet === 'VILLE_A_VILLE' ? MOROCCAN_CITIES : CASABLANCA_NEIGHBORHOODS}
                icon={<MapPin className="h-5 w-5" />}
              />
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
