import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { MOROCCAN_CITIES, CASABLANCA_NEIGHBORHOODS } from '../utils/constants';
import CustomSelect from '../components/CustomSelect';

const Home = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [searchParams, setSearchParams] = useState({
    typeTrajet: 'VILLE_A_VILLE',
    depart: '',
    arrivee: '',
    date: ''
  });
  const [trajets, setTrajets] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allTrajets, setAllTrajets] = useState([]);

  useEffect(() => {
    // Charger quelques trajets récents par défaut
    const fetchRecent = async () => {
      try {
        const res = await api.get('/trajets');
        setAllTrajets(res.data.slice(0, 6)); // Prendre les 6 premiers
      } catch (error) {
        console.error("Erreur de récupération des trajets récents:", error);
      }
    };
    fetchRecent();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.depart || !searchParams.arrivee || !searchParams.date) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/trajets/search?type=${searchParams.typeTrajet}&depart=${searchParams.depart}&arrivee=${searchParams.arrivee}&date=${searchParams.date}`);
      setTrajets(res.data);
    } catch (error) {
      console.error("Erreur de recherche", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (trajetId) => {
    try {
      await api.post(`/reservations/trajet/${trajetId}`);
      showSuccess('Demande envoyée ! En attente de confirmation du conducteur.');
    } catch (error) {
      if (error.response?.status === 401) {
        showInfo("Vous devez être connecté pour réserver.");
        window.location.href = '/login';
      } else {
        const errorMsg = typeof error.response?.data === 'string' 
          ? error.response.data 
          : (error.response?.data?.message || "Erreur lors de la réservation");
        showError(errorMsg);
      }
    }
  };

  const TrajetCard = ({ trajet }) => (
    <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group transform hover:-translate-y-1 cursor-pointer">
      <div className={`absolute top-0 left-0 text-white px-3 py-1 rounded-br-xl text-xs font-bold tracking-wider shadow-sm z-10 ${trajet.typeTrajet === 'INTRA_CASABLANCA' ? 'bg-purple-600' : 'bg-blue-600'}`}>
        {trajet.typeTrajet === 'INTRA_CASABLANCA' ? '📍 INTRA-CASA' : '🚗 VILLE À VILLE'}
      </div>
      <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-600 to-primary-400 text-white px-4 py-1.5 rounded-bl-xl font-bold tracking-wide shadow-md z-10">
        {trajet.prix} MAD
      </div>
      
      <div className="flex flex-col h-full mt-2">
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
        
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {trajet.conducteur?.nom?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{trajet.conducteur?.nom}</p>
              <p className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md inline-block mt-0.5">{trajet.placesDisponibles} places restantes</p>
            </div>
          </div>
          
          <button 
            onClick={() => handleReservation(trajet.id)}
            disabled={trajet.placesDisponibles <= 0}
            className="btn-primary py-2 px-5 text-sm font-semibold rounded-lg"
          >
            {trajet.placesDisponibles > 0 ? 'Réserver' : 'Complet'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-primary-900 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-400 blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-500 blur-3xl mix-blend-screen"></div>
        </div>

        <div className="relative pb-32 pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white animate-slide-up">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8 drop-shadow-sm">
              Vos trajets, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">moins chers</span>.
            </h1>
            <p className="text-xl sm:text-2xl max-w-2xl mx-auto text-primary-100 mb-10 font-light">
              Trouvez des covoiturages partout au Maroc, réservez facilement et voyagez en toute sérénité.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar (Overlapping Hero) */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20 mb-20 animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl w-full max-w-md mx-auto mb-4 cursor-pointer border border-white/30 shadow-lg">
          <button
            type="button"
            onClick={() => setSearchParams({ ...searchParams, typeTrajet: 'VILLE_A_VILLE', depart: '', arrivee: '' })}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${searchParams.typeTrajet === 'VILLE_A_VILLE' ? 'bg-white text-primary-600 shadow-md scale-100' : 'text-white hover:bg-white/10 scale-95'}`}
          >
            Ville à ville
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ ...searchParams, typeTrajet: 'INTRA_CASABLANCA', depart: '', arrivee: '' })}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${searchParams.typeTrajet === 'INTRA_CASABLANCA' ? 'bg-white text-primary-600 shadow-md scale-100' : 'text-white hover:bg-white/10 scale-95'}`}
          >
            Intra-Casablanca
          </button>
        </div>
        <form onSubmit={handleSearch} className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 mt-4">
          
          <div className="flex-1 relative w-full md:w-auto">
            <CustomSelect
              value={searchParams.depart}
              onChange={(val) => setSearchParams({...searchParams, depart: val})}
              placeholder={searchParams.typeTrajet === 'VILLE_A_VILLE' ? 'Ville de départ' : 'Quartier de départ'}
              options={searchParams.typeTrajet === 'VILLE_A_VILLE' ? MOROCCAN_CITIES : CASABLANCA_NEIGHBORHOODS}
              icon={<MapPin className="h-5 w-5" />}
            />
          </div>

          <div className="hidden md:flex items-center justify-center text-slate-300">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="flex-1 relative w-full md:w-auto">
            <CustomSelect
              value={searchParams.arrivee}
              onChange={(val) => setSearchParams({...searchParams, arrivee: val})}
              placeholder={searchParams.typeTrajet === 'VILLE_A_VILLE' ? "Ville d'arrivée" : "Quartier d'arrivée"}
              options={searchParams.typeTrajet === 'VILLE_A_VILLE' ? MOROCCAN_CITIES : CASABLANCA_NEIGHBORHOODS}
              icon={<MapPin className="h-5 w-5" />}
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-slate-200"></div>

          <div className="flex-1 relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400">
              <Calendar className="h-5 w-5" />
            </div>
            <input 
              type="date" 
              required 
              className="w-full bg-slate-50/80 hover:bg-white border-0 rounded-xl focus:ring-2 focus:ring-primary-500 pl-12 py-3.5 text-slate-900 placeholder:text-slate-500 font-medium transition-all" 
              value={searchParams.date} 
              onChange={e => setSearchParams({...searchParams, date: e.target.value})} 
            />
          </div>

          <button type="submit" className="w-full md:w-auto btn-primary py-3.5 px-8 text-lg rounded-xl h-full flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 font-semibold group">
            <Search className="w-5 h-5 transform group-hover:scale-110 transition-transform" /> Rechercher
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {loading && <div className="text-center text-slate-500 py-12">Recherche en cours...</div>}

        {!loading && hasSearched && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Résultats de recherche
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{trajets.length} trajet(s) trouvé(s)</span>
            </h2>
            
            {trajets.length > 0 ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {trajets.map(t => <TrajetCard key={t.id} trajet={t} />)}
               </div>
            ) : (
              <div className="bg-white text-center py-16 rounded-2xl border border-slate-200 shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun trajet trouvé</h3>
                <p className="text-slate-500 max-w-md mx-auto">Il n'y a pas de trajets correspondant à vos critères pour cette date. Essayez une date différente ou élargissez vos critères de recherche.</p>
              </div>
            )}
          </div>
        )}

        {!loading && !hasSearched && allTrajets.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Annonces récentes</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {allTrajets.map(t => <TrajetCard key={t.id} trajet={t} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
