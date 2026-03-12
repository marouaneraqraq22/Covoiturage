import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Calendar, Clock, User, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, trajetsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/trajets')
      ]);
      setUsers(usersRes.data);
      setTrajets(trajetsRes.data);
    } catch (error) {
      console.error("Erreur de récupération des données admin", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert(error.response?.data || "Erreur lors de la suppression");
      }
    }
  };

  const handleDeleteTrajet = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce trajet ?')) {
      try {
        await api.delete(`/admin/trajets/${id}`);
        setTrajets(trajets.filter(t => t.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des données administrateur...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-900 to-primary-600">Panel d'Administration</h1>
          <p className="text-slate-500 mt-2 text-lg">Gérez les utilisateurs et les annonces de la plateforme.</p>
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
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
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
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trajets.map(trajet => (
            <div key={trajet.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-inner">
                    {trajet.conducteur?.nom?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{trajet.conducteur?.nom || 'Inconnu'}</span>
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
                onClick={() => handleDeleteTrajet(trajet.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer l'annonce
              </button>
            </div>
          ))}
          
          {trajets.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              Aucun trajet publié pour le moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
