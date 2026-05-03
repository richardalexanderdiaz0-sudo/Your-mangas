import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Heart, HeartPulse, Menu, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { useAuth } from '../context/AuthContext';

export default function Reader() {
  const { workId, chapterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [work, setWork] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUI, setShowUI] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [workData, chaptersData] = await Promise.all([
          apiService.getWorkById(workId),
          apiService.getChapters(workId)
        ]);
        setWork(workData);
        const currentChapter = (chaptersData?.items || chaptersData).find(c => String(c.id) === chapterId);
        setChapter(currentChapter);
        // Suponiendo que currentChapter.pages es un arreglo de URLs
        setPages(currentChapter?.pages || []);
        
        // Registrar lectura en biblioteca si está logueado
        if (currentUser) {
           apiService.addToLibrary({ user_id: currentUser.id, manga_work_id: workId }).catch(e => console.log('Already in library or error'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [workId, chapterId, currentUser]);

  const toggleSub = (e) => {
    e.stopPropagation();
    setSubscribed(!subscribed);
    if (!subscribed) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share && work) {
      navigator.share({
        title: `${work.title} - Cap. ${chapter?.chapter_number}`,
        text: `¡NO DEJO DE LEER ${work.title.toUpperCase()}! TE INVITO A LEER!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Comparte copiando este enlace: " + window.location.href);
    }
  };

  const goToInfo = (e) => {
    e.stopPropagation();
    navigate(`/work/${workId}`);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-slate-500 font-bold animate-pulse">Cargando...</div>;
  if (!chapter) return <div className="h-screen bg-black text-white flex items-center justify-center">Capítulo no encontrado</div>;

  return (
    <div className="bg-black min-h-screen text-slate-300 relative select-none">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur text-white px-6 py-4 rounded-2xl z-50 text-center text-sm font-bold shadow-2xl animate-in zoom-in fade-in">
          ENTENDIDO, RECIBIRÁS UNA NOTIFICACIÓN EN TU CAMPANA CUANDO HAYA UNA NUEVA ACTUALIZACIÓN DE CAPITULO
        </div>
      )}

      {/* Pages Container - Touches toggle UI */}
      <div className="w-full max-w-3xl mx-auto flex flex-col" onClick={() => setShowUI(!showUI)}>
        
        {/* SIPNOSIS AL INICIO SI HAY, EL USUARIO QUIERE LA SIPNOSIS AL ENTRAR AL CAP (esto es raro pero lo pidio: "Cuando ya entra al capitulo, le debe aparecer eso de la imagen: la SIPNOSIS, y el nombre.") */}
        {/* Por lo general en el lector se pone la portada del capitulo arriba */}
        <div className="pt-8 pb-12 px-4 text-center bg-gradient-to-b from-slate-900 to-black">
           <h1 className="text-2xl font-black text-white mb-2">{work?.title}</h1>
           <h2 className="text-pink-400 font-bold mb-4">Capítulo {chapter.chapter_number}</h2>
           {work?.synopsis && <p className="text-sm text-slate-400 italic max-w-md mx-auto line-clamp-3">"{work.synopsis}"</p>}
        </div>

        {pages.map((url, idx) => (
          <img key={idx} src={url} alt={`Pagina ${idx+1}`} className="w-full block" loading="lazy" />
        ))}

        {/* Dummy pages si no hay */}
        {pages.length === 0 && (
          <div className="h-screen flex items-center justify-center text-slate-600">No hay páginas cargadas en Xano.</div>
        )}
      </div>

      {/* OVERLAY UI */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-300 z-40 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between pointer-events-auto pt-safe">
          <button onClick={() => navigate(-1)} className="p-2 text-white">
            <ChevronLeft className="w-7 h-7 filter drop-shadow-md" />
          </button>
          <div className="flex gap-4">
             <button onClick={toggleSub} className="p-2 text-white flex items-center justify-center filter drop-shadow-md transition-transform active:scale-95">
                {subscribed ? <Heart className="w-6 h-6 text-pink-500" fill="currentColor"/> : (
                  <div className="relative">
                    <Heart className="w-6 h-6" />
                    <span className="absolute -top-1 -right-2 text-[10px] font-black text-pink-500">+</span>
                  </div>
                )}
             </button>
             <button onClick={goToInfo} className="p-2 text-white filter drop-shadow-md">
                <Info className="w-6 h-6" />
             </button>
             <button onClick={handleShare} className="p-2 text-white filter drop-shadow-md">
                <Share2 className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pb-safe pointer-events-auto">
          <div className="flex items-center justify-between max-w-xs mx-auto">
             <button className="p-3 text-white hover:text-pink-400 bg-white/10 rounded-full backdrop-blur-md">
                <ArrowLeft className="w-6 h-6" />
             </button>
             <button onClick={goToInfo} className="p-3 text-white hover:text-pink-400 bg-white/10 rounded-xl backdrop-blur-md">
                <Menu className="w-6 h-6" />
             </button>
             <button className="p-3 text-white hover:text-pink-400 bg-white/10 rounded-full backdrop-blur-md">
                <ArrowRight className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
