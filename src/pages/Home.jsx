import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Crown, Sparkles, BookOpen, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { apiService } from '../lib/apiService';
import WorkCard from '../components/WorkCard';
import { cn } from '../lib/utils'; // Make sure utils exist

function SectionHeader({ icon: Icon, title, onClickMap }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-pink-500" />
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">{title}</h2>
      </div>
      {onClickMap && (
        <button onClick={onClickMap} className="text-sm font-semibold text-slate-500 hover:text-pink-500 flex items-center">
          Más <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function EmblaCarousel({ children }) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 -mt-2 pt-2">
      {React.Children.map(children, child => (
        <div className="snap-start shrink-0 w-[140px] sm:w-[160px]">
          {child}
        </div>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="w-[140px] sm:w-[160px] animate-pulse">
      <div className="aspect-[3/4] bg-pink-100 rounded-xl mb-2"></div>
      <div className="h-4 bg-pink-100 rounded w-3/4 mb-1"></div>
      <div className="h-3 bg-pink-100 rounded w-1/2"></div>
    </div>
  )
}

export default function Home() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiService.getWorks();
        // Since xano returns data array directly or nested, adapt here.
        setWorks(Array.isArray(data) ? data : data?.items || []);
      } catch (err) {
        console.error("Error loading works:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentlyAdded = works.filter(w => w.status === 'nuevo' || (!w.status && (!w.scheduled_at || new Date(w.scheduled_at) <= new Date()))).slice(0, 10);
  const upcoming = works.filter(w => w.status === 'próximamente' || (w.scheduled_at && new Date(w.scheduled_at) > new Date()));
  const finished = works.filter(w => w.status === 'finalizado');
  const allComics = works.filter(w => w.work_type === 'Manhwa' || w.work_type === 'Comic' || w.work_type === 'Manga'); // Or all

  return (
    <div className="pt-safe pb-4">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-pink-100">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 text-white font-black text-xl italic px-2 py-1 rounded-lg transform -skew-x-12">Y</div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">Your<span className="text-pink-500">manga</span></span>
        </div>
        <button 
          onClick={() => navigate('/genres')}
          className="bg-pink-50 border border-pink-100 px-4 py-2 rounded-full flex items-center gap-2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Buscar...</span>
        </button>
      </header>

      <main className="p-4 space-y-8">
        
        {/* AÑADIDOS RECIENTEMENTE */}
        <section>
          <SectionHeader icon={Sparkles} title="AÑADIDOS RECIENTEMENTE" />
          {loading ? (
             <EmblaCarousel>{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</EmblaCarousel>
          ) : (
            <EmblaCarousel>
              {recentlyAdded.map(work => <WorkCard key={work.id} work={work} />)}
            </EmblaCarousel>
          )}
        </section>

        {/* PRÓXIMAMENTE */}
        <section>
          <SectionHeader icon={Clock} title="PRÓXIMAMENTE" />
           {loading ? (
             <EmblaCarousel>{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</EmblaCarousel>
          ) : upcoming.length > 0 ? (
            <EmblaCarousel>
              {upcoming.map(work => <WorkCard key={work.id} work={work} />)}
            </EmblaCarousel>
          ) : (
            <div className="text-sm text-slate-500 bg-pink-50/50 p-4 rounded-xl text-center border border-pink-100 border-dashed">No hay estrenos programados.</div>
          )}
        </section>

        {/* CÓMICS Y MANHWAS (Requerido por el admin) */}
        <section>
          <SectionHeader icon={BookOpen} title="CÓMICS Y MANHWAS" onClickMap={() => navigate('/genres?type=all')} />
          {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allComics.slice(0,8).map(work => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          )}
        </section>

        {/* TERMINADOS */}
        <section>
          <SectionHeader icon={CheckCircle} title="TERMINADOS" />
          {loading ? (
             <EmblaCarousel>{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</EmblaCarousel>
          ) : finished.length > 0 ? (
            <EmblaCarousel>
              {finished.map(work => <WorkCard key={work.id} work={work} />)}
            </EmblaCarousel>
          ) : (
             <div className="text-sm text-slate-500 bg-pink-50/50 p-4 rounded-xl text-center border border-pink-100 border-dashed">No hay cómics/manhwas/mangas terminados.</div>
          )}
        </section>

         {/* CÓMICS/MANHWAS/MANGAS TERMINADOS (Sección redundante solicitada) */}
         <section>
          <SectionHeader icon={Crown} title="CÓMICS/MANHWAS/MANGAS TERMINADOS" />
          {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {[1, 2].map(i => <SkeletonCard key={i} />)}
             </div>
          ) : finished.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {finished.map(work => <WorkCard key={work.id} work={work} />)}
            </div>
          ) : (
             <div className="text-sm text-slate-500 bg-pink-50/50 p-4 rounded-xl text-center border border-pink-100 border-dashed">No hay obras terminadas.</div>
          )}
        </section>

      </main>
    </div>
  );
}
