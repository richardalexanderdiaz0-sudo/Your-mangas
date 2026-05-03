import { supabase } from './supabase';

export const apiService = {
  // Obtener obras
  getWorks: async (filters = {}) => {
    let query = supabase.from('manga_works').select('*').order('created_at', { ascending: false });
    if (filters.work_type) {
       query = query.eq('work_type', filters.work_type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  // Obtener una obra por ID
  getWorkById: async (id) => {
    const { data, error } = await supabase.from('manga_works').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Obtener capítulos de una obra
  getChapters: async (workId) => {
    const { data, error } = await supabase.from('manga_chapters').select('*').eq('manga_work_id', workId).order('chapter_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Obtener la biblioteca de un usuario
  getLibrary: async (userId) => {
    const { data, error } = await supabase.from('manga_library').select('*, manga_works(*)').eq('user_id', userId);
    if (error) throw error;
    return data.map(item => item.manga_works).filter(Boolean);
  },

  // Añadir a la biblioteca
  addToLibrary: async (dataPayload) => {
    const { data, error } = await supabase.from('manga_library').upsert([{
      user_id: String(dataPayload.user_id),
      manga_work_id: dataPayload.manga_work_id
    }], { onConflict: 'user_id, manga_work_id' }).select();
    if (error) throw error;
    return data;
  },

  getInteractions: async (workId) => {
    const { data, error } = await supabase.from('manga_interactions').select('*').eq('manga_work_id', workId);
    if (error) throw error;
    return data;
  },

  addInteraction: async (dataPayload) => {
    const { data, error } = await supabase.from('manga_interactions').insert([dataPayload]).select();
    if (error) throw error;
    return data;
  },

  // Admin solo
  publishWork: async (dataPayload, adminEmail) => {
    if (adminEmail !== 'richardalexanderdiaz0@gmail.com') throw new Error('No autorizado');
    const { data, error } = await supabase.from('manga_works').insert([dataPayload]).select().single();
    if (error) throw error;
    return data;
  },

  addChapter: async (dataPayload, adminEmail) => {
    if (adminEmail !== 'richardalexanderdiaz0@gmail.com') throw new Error('No autorizado');
    const { data, error } = await supabase.from('manga_chapters').insert([dataPayload]).select().single();
    if (error) throw error;
    return data;
  }
};

