import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Share2, Flame, View, ChevronDown, Flag } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { useAuth } from '../context/AuthContext';

export default function WorkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [work, setWork] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // asc o desc

  useEffect(() => {
    async function fetchWork() {
      try {
        const [workData, chaptersData] = await Promise.all([
          apiService.getWorkById(id),
          apiService.getChapters(id)
        ]);
        setWork(workData);
        setChapters(Array.isArray(chaptersData) ? chaptersData : chaptersData.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWork();
  }, [id]);

  const handleShare = () => {
    if (navigator.share && work) {
      navigator.share({
        title: work.title,
        text: `¡NO DEJO DE LEER ${work.title.toUpperCase()}! TE INVITO A LEER!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("La función de compartir no está soportada en este navegador, pero puedes copiar el enlace.");
    }
    setShowMenu(false);
  };

  const handleReport = () => {
    alert("Reporte enviado.");
    setShowMenu(false);
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 animate-pulse">Cargando...</div>;
  if (!work) return <div className="h-screen flex items-center justify-center font-bold text-slate-500">Obra no encontrada</div>;

  const sortedChapters = [...chapters].sort((a,b) => {
    const numA = parseFloat(a.chapter_number) || 0;
    const numB = parseFloat(b.chapter_number) || 0;
    return sortOrder === 'asc' ? numA - numB : numB - numA;
  });

  return (
    <div className="bg-slate-900 min-h-screen text-white pb-24">
      {/* Portada grande tipo Netflix */}
      <div className="relative w-full aspect-[2/3] max-h-[70vh]">
        {work.cover_url ? (
          <img src={work.cover_url} alt={work.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">Sin Portada</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pt-safe backdrop-blur-sm bg-black/20">
          <button onClick={() => navigate(-1)} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
              <Share2 className="w-5 h-5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                  {!isAdmin && (
                    <button onClick={handleReport} className="w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2 hover:bg-red-50">
                      <Flag className="w-4 h-4"/> Reportar
                    </button>
                  )}
                  <button onClick={handleShare} className="w-full px-4 py-2 text-left text-sm text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                    <Share2 className="w-4 h-4"/> Compartir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info on top of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex flex-wrap gap-2 mb-3">
             <span className="bg-pink-500 text-white text-[10px] uppercase font-bold py-1 px-2 rounded-md">{work.work_type || 'Manhwa'}</span>
             <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold py-1 px-2 rounded-md border border-white/30">{work.status}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1 leading-tight">{work.title}</h1>
          <p className="text-slate-300 text-sm font-medium">{work.author}</p>
          <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-slate-300">
             <div className="flex items-center gap-1"><View className="w-4 h-4 text-slate-400" /> {(work.read_count || 0).toLocaleString()}</div>
             <div className="flex items-center gap-1"><Flame className="w-4 h-4 text-pink-500" fill="currentColor"/> {(work.likes_count || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Categories / Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(work.tags || []).map(tag => (
            <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-medium border border-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="relative mb-8">
          <p className={`text-slate-300 text-sm leading-relaxed ${!showFullSynopsis && 'line-clamp-3'}`}>
            {work.synopsis || "Sin sinopsis disponible."}
          </p>
          {work.synopsis && work.synopsis.length > 150 && (
            <button 
              onClick={() => setShowFullSynopsis(!showFullSynopsis)} 
              className="mt-1 text-pink-400 text-sm font-semibold hover:text-pink-300"
            >
              {showFullSynopsis ? 'Ocultar' : 'Leer más'}
            </button>
          )}
        </div>

        {/* Episodios */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Episodios <span className="text-slate-400 text-sm font-normal">({chapters.length})</span></h2>
          <div className="flex items-center gap-4">
             <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="text-slate-400 hover:text-white text-sm flex items-center">
                 {sortOrder === 'asc' ? 'Asc' : 'Desc'}
             </button>
             {chapters.length > 5 && (
               <button onClick={() => setShowAllChapters(true)} className="text-pink-400 font-semibold text-sm hover:text-pink-300">
                 Más
               </button>
             )}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {sortedChapters.slice(0, 10).map((chapter) => (
            <div 
              key={chapter.id} 
              onClick={() => navigate(`/read/${work.id}/${chapter.id}`)}
              className="snap-start shrink-0 w-[140px] cursor-pointer group"
            >
              <div className="aspect-[16/9] md:aspect-[3/4] bg-slate-800 rounded-xl mb-2 overflow-hidden relative">
                 {chapter.cover_url ? (
                   <img src={chapter.cover_url} alt={`Capítulo ${chapter.chapter_number}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Sin img</div>
                 )}
                 <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold">Cap. {chapter.chapter_number}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pantalla modal de todos los capítulos */}
      {showAllChapters && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md pt-safe border-b border-slate-800">
              <h2 className="font-bold text-lg">Episodios ({chapters.length})</h2>
              <div className="flex gap-4">
                  <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="text-pink-400 text-sm font-semibold">
                      {sortOrder === 'asc' ? 'Invertir' : 'Normal'}
                  </button>
                  <button onClick={() => setShowAllChapters(false)} className="text-white">
                      <ChevronDown className="w-6 h-6" />
                  </button>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sortedChapters.map(chapter => (
                <div key={chapter.id} onClick={() => { setShowAllChapters(false); navigate(`/read/${work.id}/${chapter.id}`); }} className="cursor-pointer group">
                  <div className="aspect-[16/9] bg-slate-800 rounded-xl mb-2 overflow-hidden relative">
                    {chapter.cover_url && <img src={chapter.cover_url} className="w-full h-full object-cover" loading="lazy"/>}
                  </div>
                  <div className="font-semibold text-sm">Capítulo {chapter.chapter_number}</div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
