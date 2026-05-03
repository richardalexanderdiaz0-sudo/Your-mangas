import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../lib/apiService';
import WorkCard from '../components/WorkCard';

export default function Library() {
  const { currentUser } = useAuth();
  const [libraryWorks, setLibraryWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLibrary() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiService.getLibrary(currentUser.uid); // or email depending on your backend
        // Assume data contains joined manga_work info
        let list = Array.isArray(data) ? data : data.items || [];
        // Map assuming Xano library table returns `{ id, user_id, manga_work_id, manga_work: { ... }}`
        list = list.map(item => item.manga_work ? item.manga_work : item);
        setLibraryWorks(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mi Biblioteca</h2>
        <p className="text-slate-500 mb-6">Inicia sesión para ver tus mangas guardados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-safe pb-4">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-pink-50">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-extrabold text-slate-800 border-b-4 border-pink-500 inline-block pb-1">Mi biblioteca</h1>
           <span className="text-lg font-semibold text-slate-400">Recientes</span>
        </div>
        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors">
          <Trash2 className="w-6 h-6" />
        </button>
      </header>

      <main className="p-4">
        {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
               {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse"/>)}
             </div>
        ) : libraryWorks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {libraryWorks.map((work) => (
              <div key={work.id}>
                <WorkCard work={work} />
                <div className="text-xs text-slate-500 mt-1 font-medium">Leer 1/{work.chapters_count || '?'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-pink-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tu biblioteca está vacía</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">Los cómics y manhwas que leas se guardarán aquí automáticamente.</p>
          </div>
        )}
      </main>
    </div>
  );
}
