import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aceviynvsorxjpcvjjya.supabase.co';
const supabaseKey = 'sb_publishable_K9uWxkrx9zQzhvo9b0m1vw_Z1cQ5Us1';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadCover(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  const { error } = await supabase.storage
    .from('manga-storage')
    .upload(filePath, file);

  if (error) throw error;
  
  const { data } = supabase.storage.from('manga-storage').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadPage(file, folderPath) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `pages/${folderPath}/${fileName}`;

  const { error } = await supabase.storage
    .from('manga-storage')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from('manga-storage').getPublicUrl(filePath);
  return data.publicUrl;
}
