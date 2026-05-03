import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Plus, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { uploadCover, uploadPage } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["YAOI", "BL", "+18", "Romance", "Acción", "Misterio", "Fantasía", "Vida cotidiana", "Bullying", "Cárcel"];

// Admin panel for "Estudio"
export default function Study() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [publishModal, setPublishModal] = useState(false);

  // Form state
  const [workType, setWorkType] = useState('Manhwa'); // Comic, Manga, Manhwa
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [status, setStatus] = useState('en emisión'); // finalizado, en emisión
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [chapterCount, setChapterCount] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Array of chapters, each with an array of page files
  const [chapterPages, setChapterPages] = useState([{ number: 1, files: [] }]);

  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center p-4 text-center font-bold text-red-500">Acceso Denegado. Solo administradores.</div>;
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePageUpload = (chapterIndex, e) => {
    const files = Array.from(e.target.files);
    const newPages = [...chapterPages];
    newPages[chapterIndex].files = [...newPages[chapterIndex].files, ...files];
    setChapterPages(newPages);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const generateChapterSlots = (count) => {
    const slots = [];
    for(let i=1; i<=count; i++) {
       slots.push({ number: i, files: [] });
    }
    setChapterPages(slots);
  }

  const handlePublish = async () => {
    setLoading(true);
    try {
      // 1. Upload Cover
      let coverUrl = '';
      if (coverFile) {
        coverUrl = await uploadCover(coverFile);
      }

      // 2. Publish Work to Xano
      let currentStatus = isUpcoming ? 'próximamente' : status;
      if (isUpcoming && scheduledAt && new Date(scheduledAt) <= new Date()) {
          currentStatus = 'nuevo'; // O "en emisión"
      }

      const workPayload = {
        title,
        synopsis,
        cover_url: coverUrl,
        work_type: workType,
        status: currentStatus,
        scheduled_at: isUpcoming ? scheduledAt : null,
        tags: selectedTags,
        author: currentUser.displayName || 'Admin'
      };

      const newWork = await apiService.publishWork(workPayload, currentUser.email);
      const workId = newWork.id;

      // 3. Upload Pages and create chapters
      for (let i = 0; i < chapterPages.length; i++) {
        const chap = chapterPages[i];
        if (chap.files.length > 0) {
          const pageUrls = [];
          for (let j = 0; j < chap.files.length; j++) {
            const url = await uploadPage(chap.files[j], `work_${workId}_chap_${chap.number}`);
            pageUrls.push(url);
          }
          await apiService.addChapter({
            manga_work_id: workId,
            chapter_number: String(chap.number),
            pages: pageUrls,
            cover_url: pageUrls[0] // Set first page as chapter cover
          }, currentUser.email);
        }
      }

      alert("Obra publicada con éxito!");
      navigate('/');

    } catch (err) {
      console.error(err);
      alert("Error al publicar: " + err.message);
    } finally {
      setLoading(false);
      setPublishModal(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      <header className="bg-white p-4 border-b border-slate-200 sticky top-0 z-40 pt-safe">
        <h1 className="text-xl font-black text-pink-500 flex items-center justify-center gap-2">
           <PenTool className="w-5 h-5"/> Estudio de Creador
        </h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right h-full">
            <h2 className="text-lg font-bold text-slate-800">1. Detalles Principales</h2>
            
            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Tipo de Obra</label>
               <select value={workType} onChange={(e) => setWorkType(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-pink-300 outline-none">
                 <option>Comic</option>
                 <option>Manga</option>
                 <option>Manhwa</option>
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Portada de la Obra</label>
               <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 overflow-hidden relative">
                    {coverPreview ? (
                      <img src={coverPreview} className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Click para subir foto</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                  </label>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Título</label>
               <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-white" placeholder="Ej. Solo Leveling"/>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Sinopsis</label>
               <textarea value={synopsis} onChange={(e)=>setSynopsis(e.target.value)} rows="3" className="w-full p-3 rounded-xl border border-slate-200 bg-white resize-none" placeholder="Corto resumen..."></textarea>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Estado</label>
               <div className="flex gap-4">
                 <label className="flex items-center gap-2">
                   <input type="radio" name="status" checked={status === 'finalizado'} onChange={() => {setStatus('finalizado'); setIsUpcoming(false);}} className="text-pink-500 focus:ring-pink-500"/> Finalizado
                 </label>
                 <label className="flex items-center gap-2">
                   <input type="radio" name="status" checked={status === 'en emisión'} onChange={() => setStatus('en emisión')} className="text-pink-500 focus:ring-pink-500"/> En emisión
                 </label>
               </div>
            </div>
            
            {status === 'en emisión' && (
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 space-y-4">
                 <p className="text-sm text-yellow-800 font-medium">¿Quieres publicarla "próximamente"?</p>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="up" checked={isUpcoming} onChange={()=>setIsUpcoming(true)}/> Sí, agendar</label>
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="up" checked={!isUpcoming} onChange={()=>setIsUpcoming(false)}/> No, publicar normal</label>
                 </div>
                 {isUpcoming && (
                   <input type="datetime-local" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} className="w-full p-2 border rounded-md text-sm"/>
                 )}
              </div>
            )}

            <button disabled={!title} onClick={() => setStep(2)} className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl disabled:opacity-50">Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right">
             <h2 className="text-lg font-bold text-slate-800">2. Módulos y Capítulos</h2>
             <div className="bg-pink-50 p-4 rounded-xl">
               <label className="text-sm font-semibold text-pink-800 block mb-2">¿Cuántos capítulos vas a subir ahora?</label>
               <input type="number" min="1" value={chapterCount} onChange={(e) => {setChapterCount(Number(e.target.value)); generateChapterSlots(Number(e.target.value));}} className="w-full p-3 rounded-xl border border-pink-200 font-bold text-lg"/>
             </div>

             <div className="space-y-4">
                {chapterPages.map((chap, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white">
                     <h3 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                       Capítulo {chap.number}
                       <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{chap.files.length} pág(s)</span>
                     </h3>
                     <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <p className="text-xs font-semibold">Añadir páginas a este cap.</p>
                        </div>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handlePageUpload(idx, e)} />
                     </label>
                  </div>
                ))}
             </div>

             <div className="flex gap-4">
               <button onClick={() => setStep(1)} className="flex-1 bg-slate-200 text-slate-600 font-bold py-3 rounded-xl">Atrás</button>
               <button onClick={() => setStep(3)} className="flex-1 bg-pink-500 text-white font-bold py-3 rounded-xl">Continuar</button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right">
             <h2 className="text-lg font-bold text-slate-800">3. Etiquetas y Categorías</h2>
             <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedTags.includes(tag) ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {tag}
                  </button>
                ))}
             </div>
             
             <div className="flex gap-4 mt-8">
               <button onClick={() => setStep(2)} className="flex-1 bg-slate-200 text-slate-600 font-bold py-3 rounded-xl">Atrás</button>
               <button onClick={() => setPublishModal(true)} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl">Revisar y Publicar</button>
             </div>
          </div>
        )}
      </main>

      {publishModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="bg-pink-500 p-6 flex flex-col items-center text-center">
                 <div className="w-24 h-32 rounded bg-white overflow-hidden shadow-lg mb-4">
                    {coverPreview && <img src={coverPreview} className="w-full h-full object-cover"/>}
                 </div>
                 <h2 className="text-white font-black text-xl">{title}</h2>
              </div>
              <div className="p-6">
                 <p className="text-sm text-slate-600 font-medium mb-4 text-center">
                   En pasos anteriores elegiste que <strong>{title}</strong> está {status} {isUpcoming && 'y programado'}. Será publicado para los usuarios en las listas correspondientes.
                 </p>
                 <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 mb-6">
                    <p><strong>Tipo:</strong> {workType}</p>
                    <p><strong>Capítulos:</strong> {chapterCount}</p>
                    <p><strong>Categorías:</strong> {selectedTags.join(', ')}</p>
                    <p><strong>Autor (Tú):</strong> {currentUser.displayName || 'Admin'}</p>
                 </div>
                 
                 <p className="text-xs text-center font-bold text-slate-400 mb-4 uppercase">¿Estás seguro de publicar?</p>

                 <div className="flex gap-2">
                   <button disabled={loading} onClick={() => setPublishModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200">No, editar</button>
                   <button disabled={loading} onClick={handlePublish} className="flex-1 py-3 text-sm font-bold text-white bg-pink-500 rounded-xl flex items-center justify-center">
                      {loading ? 'Publicando...' : 'Sí, Publicar'}
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// Small missing icon import hack since I can't modify it above easily:
import { PenTool } from 'lucide-react';
