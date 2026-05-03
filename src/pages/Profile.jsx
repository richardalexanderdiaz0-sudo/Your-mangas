import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Settings, Globe, Mail, Users, LogIn } from 'lucide-react';

export default function Profile() {
  const { currentUser, loginWithGoogle, logout } = useAuth();

  return (
    <div className="bg-[#fcf8fa] min-h-screen pt-safe pb-24">
      <header className="p-4 flex items-center justify-center sticky top-0 bg-[#fcf8fa]/90 backdrop-blur-md z-40">
        <h1 className="text-xl font-extrabold text-slate-800">Mi</h1>
      </header>

      {currentUser ? (
        <div className="px-6 mb-8 mt-4 flex items-center gap-4 bg-white mx-4 p-4 rounded-3xl shadow-sm border border-pink-50">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-pink-200 shrink-0 border-2 border-white shadow-md">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                 <span className="text-2xl">🌙</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{currentUser.displayName || 'Usuario de Yourmanga'}</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">ID: {currentUser.uid.slice(0,8)}</p>
          </div>
        </div>
      ) : (
        <div className="px-6 mb-8 mt-4">
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(236,72,153,0.3)] hover:bg-pink-600 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Iniciar sesión con Google
          </button>
        </div>
      )}

      <main className="px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
          
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="font-semibold text-slate-700">Administrar cuenta</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-pink-400" />
              <span className="font-semibold text-slate-700">Idioma</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-pink-400" />
              <span className="font-semibold text-slate-700">Configuración</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-pink-400" />
              <span className="font-semibold text-slate-700">Retroalimentación</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
          
        </div>

        {currentUser && (
          <button 
            onClick={logout}
            className="w-full mt-6 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            Cerrar Sesión
          </button>
        )}
        
        <div className="text-center mt-12 mb-6 text-slate-300 font-medium text-sm">
          V1.9.7
        </div>
      </main>
    </div>
  );
}
