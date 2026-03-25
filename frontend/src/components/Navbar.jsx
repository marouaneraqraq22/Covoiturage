import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass-card sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl tracking-tight transition-all duration-300 hover:scale-105">
            <Car className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">Covoiturage.ma</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {token ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                {user?.role === 'CONDUCTEUR' && (
                  <>
                    <Link to="/proposer" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors relative group">
                      Proposer un trajet
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link to="/mes-trajets" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors relative group">
                      Mes annonces
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </>
                )}
                <Link to="/mes-reservations" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors relative group">
                  Mes réservations
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <div className="flex items-center gap-2 pl-4 border-l border-slate-200 ml-2">
                  <Link 
                    to="/profil"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold shadow-md transform transition hover:scale-110"
                    title="Mon Profil"
                  >
                    {user?.nom?.charAt(0).toUpperCase()}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 transform hover:rotate-12"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm transform hover:scale-105 transition-transform duration-300">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
