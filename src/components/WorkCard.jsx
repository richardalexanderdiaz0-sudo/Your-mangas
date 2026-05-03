import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import Countdown from './Countdown';
import { cn } from '../lib/utils';

export default function WorkCard({ work }) {
  const isFinished = work.status === 'finalizado';
  const isNew = work.status === 'nuevo';
  const isUpcoming = work.status === 'próximamente' || (work.scheduled_at && new Date(work.scheduled_at) > new Date());

  return (
    <Link to={`/work/${work.id}`} className="group block w-full relative">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-md bg-pink-100">
        {work.cover_url ? (
           <img 
            src={work.cover_url} 
            alt={work.title} 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-pink-300">
            <Star className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-semibold">Sin portada</span>
          </div>
        )}
        
        {/* Etiquetas de estado superiores */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFinished && <span className="bg-slate-800 text-white text-[10px] uppercase font-bold py-1 px-2 rounded-md tracking-wider">Finalizado</span>}
          {isNew && <span className="bg-pink-500 text-white text-[10px] uppercase font-bold py-1 px-2 rounded-md tracking-wider">Nuevo</span>}
          {work.status === 'actualizado' && <span className="bg-yellow-400 text-slate-900 text-[10px] uppercase font-bold py-1 px-2 rounded-md tracking-wider">Actualizado</span>}
        </div>

        {/* Info inferior en la portada */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-medium bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">{work.work_type || 'Manhwa'}</span>
            <div className="flex items-center gap-1 font-semibold text-pink-200">
              <Flame className="w-3 h-3 text-pink-500" fill="currentColor" />
              {(work.likes_count || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-pink-600 transition-colors">{work.title}</h3>
        {work.author && <p className="text-xs text-slate-500 mt-0.5 truncate">{work.author}</p>}
        {isUpcoming && work.scheduled_at && <Countdown scheduledAt={work.scheduled_at} />}
      </div>
    </Link>
  );
}
