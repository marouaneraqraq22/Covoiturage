import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((rawMessage, type = 'info') => {
    let message = "Une erreur est survenue.";
    if (typeof rawMessage === 'string') {
      message = rawMessage;
    } else if (rawMessage && typeof rawMessage === 'object') {
      message = rawMessage.message || rawMessage.error || JSON.stringify(rawMessage);
    } else if (rawMessage) {
      message = String(rawMessage);
    }

    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = (message) => addNotification(message, 'success');
  const showError = (message) => addNotification(message, 'error');
  const showInfo = (message) => addNotification(message, 'info');

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`pointer-events-auto flex items-center gap-3 w-80 p-4 rounded-xl shadow-lg shadow-slate-200/50 border transition-all duration-300 transform translate-y-0 opacity-100 ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
            style={{ animation: 'slideIn 0.3s ease-out forwards' }}
          >
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-sm font-medium flex-1">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};
