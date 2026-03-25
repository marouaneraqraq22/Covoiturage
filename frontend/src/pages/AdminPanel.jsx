import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Calendar, Clock, User, Trash2, Mail, Phone, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const AdminPanel = () => {
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [trajets, setTrajets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: null, itemName: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewUserModal, setViewUserModal] = useState({ open: false, user: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, trajetsRes, resesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/trajets'),
        api.get('/admin/reservations')
      ]);
      setUsers(usersRes.data);
      setTrajets(trajetsRes.data);
      setReservations(resesRes.data);
    } catch (error) {
      console.error("Erreur de récupération des données admin", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const requestDelete = (id, type, itemName) => {
    setDeleteModal({ open: true, id, type, itemName });
  };

  const confirmDelete = async () => {
    const { id, type } = deleteModal;
    setDeleteModal({ ...deleteModal, open: false });

    if (type === 'user') {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
        showSuccess('Utilisateur supprimé avec succès');
      } catch (error) {
        showError(error.response?.data || "Erreur lors de la suppression de l'utilisateur");
      }
    } else if (type === 'trajet') {
      try {
        await api.delete(`/admin/trajets/${id}`);
        setTrajets(trajets.filter(t => t.id !== id));
        showSuccess('Trajet supprimé avec succès');
      } catch (error) {
        showError(error.response?.data || "Erreur lors de la suppression du trajet");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des données administrateur...</div>;

  const filteredUsers = users.filter(u => 
    u.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTrajets = trajets.filter(t => 
    t.villeDepart.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.villeArrivee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.conducteur?.nom?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReservations = reservations.filter(r => 
    r.passager?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.trajet?.villeDepart.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.trajet?.conducteur?.nom?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const AdminTrajetCard = ({ trajet }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors border border-transparent hover:border-slate-100"
          onClick={(e) => { e.stopPropagation(); setViewUserModal({ open: true, user: trajet.conducteur }); }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-inner">
            {trajet.conducteur?.nom?.charAt(0) || '?'}
          </div>
          <span className="text-sm font-bold text-slate-800 hover:text-primary-600 transition-colors">{trajet.conducteur?.nom || 'Inconnu'}</span>
        </div>
        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{trajet.prix} MAD</span>
      </div>
      
      <div className="flex flex-col gap-3 flex-grow">
        <div className="flex items-center gap-3 text-slate-700">
          <MapPin className="w-5 h-5 text-slate-400" />
          <span className="font-medium">{trajet.villeDepart} <span className="text-slate-400 mx-1">→</span> {trajet.villeArrivee}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 text-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{trajet.dateDepart}</span>
          <Clock className="w-4 h-4 text-slate-400 ml-2" />
          <span>{trajet.heureDepart}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 text-sm mt-auto pt-4 border-t border-slate-100">
          <User className="w-4 h-4 text-slate-400" />
          <span>{trajet.placesDisponibles} place(s) disponible(s)</span>
        </div>
      </div>
      
      <button 
        onClick={() => requestDelete(trajet.id, 'trajet', `Trajet de ${trajet.villeDepart} vers ${trajet.villeArrivee}`)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
      >
        <Trash2 className="w-4 h-4" />
        Supprimer l'annonce
      </button>
    </div>
  );

  const trajetsVilleAVille = filteredTrajets.filter(t => t.typeTrajet === 'VILLE_A_VILLE');
  const trajetsIntraCasa = filteredTrajets.filter(t => t.typeTrajet === 'INTRA_CASABLANCA');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="animate-fade-in w-full md:w-auto">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-900 to-primary-600">Panel d'Administration</h1>
          <p className="text-slate-500 mt-2 text-lg">Gérez les utilisateurs et les annonces de la plateforme.</p>
          
          <div className="mt-6 relative max-w-lg w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher utilisateur, trajet, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
            />
          </div>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'users' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Utilisateurs <span className="ml-1 bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">{users.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('trajets')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'trajets' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Trajets <span className="ml-1 bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">{trajets.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'reservations' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Réservations <span className="ml-1 bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">{reservations.length}</span>
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setViewUserModal({ open: true, user })}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {user.nom.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{user.email}</div>
                    <div className="text-sm text-slate-500">{user.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'CONDUCTEUR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'ADMIN' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); requestDelete(user.id, 'user', user.nom); }} 
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors hover:shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'trajets' && (
        <div className="flex flex-col gap-10 animate-fade-in">
          {/* Section Ville à Ville */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm tracking-wide">🚗 VILLE À VILLE</span>
              <span className="text-slate-500 font-medium text-sm">({trajetsVilleAVille.length} annonce{trajetsVilleAVille.length > 1 ? 's' : ''})</span>
            </h2>
            
            {trajetsVilleAVille.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                Aucun trajet Ville à ville publié.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trajetsVilleAVille.map(trajet => (
                  <AdminTrajetCard key={trajet.id} trajet={trajet} />
                ))}
              </div>
            )}
          </div>

          {/* Section Intra-Casablanca */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm tracking-wide">📍 INTRA-CASABLANCA</span>
              <span className="text-slate-500 font-medium text-sm">({trajetsIntraCasa.length} annonce{trajetsIntraCasa.length > 1 ? 's' : ''})</span>
            </h2>
            
            {trajetsIntraCasa.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                Aucun trajet Intra-Casablanca publié.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trajetsIntraCasa.map(trajet => (
                  <AdminTrajetCard key={trajet.id} trajet={trajet} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Passager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trajet Lié</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conducteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredReservations.map(resa => (
                <tr key={resa.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="flex items-center cursor-pointer hover:bg-slate-50 rounded-lg p-1 -ml-1 transition-colors border border-transparent hover:border-slate-200"
                      onClick={() => setViewUserModal({ open: true, user: resa.passager })}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {resa.passager?.nom?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors">{resa.passager?.nom}</div>
                        <div className="text-xs text-slate-500">{resa.passager?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{resa.trajet?.villeDepart} → {resa.trajet?.villeArrivee}</div>
                    <div className="text-xs text-slate-500">{resa.trajet?.dateDepart} à {resa.trajet?.heureDepart}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm text-slate-900 font-medium cursor-pointer hover:text-primary-600 transition-colors"
                      onClick={() => setViewUserModal({ open: true, user: resa.trajet?.conducteur })}
                    >
                      {resa.trajet?.conducteur?.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-lg 
                      ${resa.statut === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        resa.statut === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        resa.statut === 'CANCELED' ? 'bg-slate-200 text-slate-700' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {resa.statut === 'CONFIRMED' ? 'Confirmé' : resa.statut === 'REJECTED' ? 'Refusé' : resa.statut === 'CANCELED' ? 'Annulé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
              
              {reservations.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500 border-dashed">
                    Aucune réservation n'a été effectuée sur la plateforme.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                Supprimer {deleteModal.type === 'user' ? "l'utilisateur" : "le trajet"} ?
              </h3>
              <p className="text-slate-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement <strong>{deleteModal.itemName}</strong> ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ open: false, id: null, type: null, itemName: '' })}
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

      {/* Modal Vue Utilisateur (Profil) */}
      {viewUserModal.open && viewUserModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up relative">
            <button 
              onClick={() => setViewUserModal({ open: false, user: null })} 
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10 bg-black/20 hover:bg-black/30 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 h-28 w-full"></div>
            
            <div className="px-6 pb-8 pt-0 relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white p-1.5 -mt-12 shadow-lg mb-4">
                <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl">
                  {viewUserModal.user.nom.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900">{viewUserModal.user.nom}</h3>
              <span className={`inline-block mt-2 mb-6 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                    ${viewUserModal.user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                      viewUserModal.user.role === 'CONDUCTEUR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {viewUserModal.user.role}
              </span>
              
              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span className="font-medium truncate">{viewUserModal.user.email}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span className="font-medium">{viewUserModal.user.telephone}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 w-full pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-2xl font-black text-primary-600">
                     {trajets.filter(t => t.conducteur?.id === viewUserModal.user.id).length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Annonces</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-2xl font-black text-green-600">
                     {reservations.filter(r => r.passager?.id === viewUserModal.user.id).length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Réservations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
