import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { apiService } from '../lib/apiService';
import WorkCard from '../components/WorkCard';

const GENRES = ["Todo", "Romance", "Fantasía", "Acción", "BL", "Drama", "Yaoi", "Vida Escolar", "+18", "Comedia"];
const CHANNELS = ["Todo", "Canal masculino", "Canal femenino"];
const STATUSES = ["Todo", "En curso", "Finalizados"];
const SORTS = ["Popular", "Nuevo", "Calificar"];

export default function Genres() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filters
  const [genre, setGenre] = useState("Todo");
  const [channel, setChannel] = useState("Todo");
  const [status, setStatus] = useState("Todo");
  const [sort, setSort] = useState("Popular");

  useEffect(() => {
    async function fetchWorks() {
      setLoading(true);
      try {
        const data = await apiService.getWorks();
        let allWorks = Array.isArray(data) ? data : data.items || [];
        
        // Simular filtrado local (el backend debería hacerlo idealmente)
        if (search) {
          allWorks = allWorks.filter(w => w.title.toLowerCase().includes(search.toLowerCase()) || w.author?.toLowerCase().includes(search.toLowerCase()));
        }
        if (status === 'Finalizados') {
          allWorks = allWorks.filter(w => w.status === 'finalizado');
        } else if (status === 'En curso') {
          allWorks = allWorks.filter(w => w.status !== 'finalizado');
        }
        
        if (genre !== 'Todo') {
           allWorks = allWorks.filter(w => w.tags && JSON.stringify(w.tags).includes(genre));
        }

        if (sort === 'Popular') {
          allWorks.sort((a,b) => (b.likes_count || 0) - (a.likes_count || 0));
        } else if (sort === 'Nuevo') {
          allWorks.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        setWorks(allWorks);
      } catch (err) {
        console.error(err);
      } finally {
         setLoading(false);
      }
    }
    fetchWorks();
  }, [search, genre, channel, status, sort]);

  const FilterRow = ({ items, current, onChange }) => (
    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-4">
      {items.map(item => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            current === item 
              ? 'bg-pink-100 text-pink-600' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-safe pb-4">
      <header className="sticky top-0 bg-white z-40 border-b border-pink-50 pb-2">
         <div className="p-4 flex items-center justify-center relative">
            <h1 className="text-xl font-extrabold text-slate-800">Géneros</h1>
            <div className="absolute right-4 top-4">
               <Search className="w-6 h-6 text-slate-800" />
            </div>
         </div>
         <div className="px-4 mb-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Buscar cómics o manhwas..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
             />
             {search && (
               <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                 <X className="w-4 h-4 text-slate-400" />
               </button>
             )}
           </div>
         </div>
         
         <div className="space-y-1">
           <FilterRow items={GENRES} current={genre} onChange={setGenre} />
           <FilterRow items={CHANNELS} current={channel} onChange={setChannel} />
           <FilterRow items={STATUSES} current={status} onChange={setStatus} />
           <FilterRow items={SORTS} current={sort} onChange={setSort} />
         </div>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-2"></div>
                  <div className="h-4 bg-slate-100 w-3/4 rounded mb-1"></div>
               </div>
             ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
            {works.map(work => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 font-medium">
            No se encontraron resultados para tu búsqueda.
          </div>
        )}
      </main>
    </div>
  );
}
