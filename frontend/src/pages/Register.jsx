import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Car, User, Mail, Lock, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    cin: '',
    email: '',
    password: '',
    telephone: '',
    role: 'PASSAGER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        role: response.data.role,
        nom: response.data.nom
      }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600">
          <Car className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Rejoignez l'aventure
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">connectez-vous à votre compte</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${formData.role === 'PASSAGER' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setFormData({...formData, role: 'PASSAGER'})}
              >
                Passager
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${formData.role === 'CONDUCTEUR' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setFormData({...formData, role: 'CONDUCTEUR'})}
              >
                Conducteur
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input type="text" name="nom" required className="input-field pl-10" value={formData.nom} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input type="text" name="cin" required className="input-field pl-10" placeholder="Ex: AB123456" value={formData.cin} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input type="email" name="email" required className="input-field pl-10" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input type="tel" name="telephone" required className="input-field pl-10" value={formData.telephone} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input type="password" name="password" required className="input-field pl-10" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
