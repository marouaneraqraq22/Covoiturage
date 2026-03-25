import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Shield, Clock, MapPin } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const Profil = () => {
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nom: '', email: '', telephone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile(response.data);
        setEditForm({
          nom: response.data.nom,
          email: response.data.email,
          telephone: response.data.telephone || ''
        });
      } catch (error) {
        showError("Impossible de charger votre profil. Veuillez vous reconnecter.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showError]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-slate-200 mb-4"></div>
          <div className="h-6 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/me', editForm);
      setProfile(res.data.user);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        showSuccess("Profil mis à jour ! L'email a été modifié, votre session a été rafraîchie.");
      } else {
        showSuccess("Profil mis à jour avec succès !");
      }
      setIsEditing(false);
    } catch (error) {
      showError(error.response?.data || "Erreur lors de la mise à jour du profil.");
    }
  };

  const roleText = profile.role === 'ADMIN' ? 'Administrateur' : profile.role === 'CONDUCTEUR' ? 'Conducteur' : 'Passager';
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Profile */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden mb-8 transform transition-all hover:shadow-2xl hover:shadow-primary-100">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 text-3xl font-bold">
                  {profile.nom.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="absolute right-6 top-6 flex flex-col md:flex-row items-end md:items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/30">
                <Shield className="w-4 h-4" />
                {roleText}
              </span>
              <button 
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (isEditing) setEditForm({ nom: profile.nom, email: profile.email, telephone: profile.telephone || '' });
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-semibold border transition-all shadow-sm ${
                  isEditing 
                  ? 'bg-slate-900/40 text-white border-white/20 hover:bg-slate-900/60' 
                  : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                }`}
              >
                {isEditing ? 'Annuler' : 'Éditer le profil'}
              </button>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{profile.nom}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <User className="w-4 h-4" /> Membre de la plateforme
            </p>
          </div>
        </div>

        {/* Mode Formulaire ou Affichage */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-8 shadow-md shadow-slate-200/30 border border-slate-100 animate-fade-in relative z-10 -mt-2">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Modifier mes informations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  value={editForm.nom} 
                  onChange={e => setEditForm({...editForm, nom: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Adresse Email</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  value={editForm.telephone} 
                  onChange={e => setEditForm({...editForm, telephone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
              <button 
                type="submit" 
                className="btn-primary py-2.5 px-8 shadow-md font-semibold text-sm w-full md:w-auto"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 -mt-2">
            <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/30 border border-slate-100 hover:border-primary-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Adresse Email</p>
                  <p className="text-slate-900 font-semibold">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/30 border border-slate-100 hover:border-primary-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Numéro de téléphone</p>
                  <p className="text-slate-900 font-semibold">{profile.telephone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/30 border border-slate-100 hover:border-primary-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Numéro CIN</p>
                  <p className="text-slate-900 font-semibold">{profile.cin}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/30 border border-slate-100 hover:border-primary-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Conducteur/Passager</p>
                  <p className="text-slate-900 font-semibold">{roleText}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profil;
