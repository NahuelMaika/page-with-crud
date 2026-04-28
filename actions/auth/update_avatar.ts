'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  //1. Subir imagen al bucket de avatars
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file,{upsert: true, contentType: file.type});

  if (uploadError) {
    throw new Error('Error al subir la imagen: ' + uploadError.message)
  }

  //2. Obtener la URL de la imagen
  const { data:  publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  
  if(!publicUrlData.publicUrl) {
    throw new Error('Error al obtener la URL de la imagen')
  }

  //3. Actualizar el avatar del usuario en la base de datos
  const { error: updateError } = await supabase
  .from('profiles')
  .update({ 
    avatar_url: publicUrlData.publicUrl,
    updated_at: new Date().toISOString() 
  })
  .eq('id', userId);

  if (updateError) {
    throw new Error('Error al actualizar el avatar: ' + updateError.message)
  }

  return { publicUrl: publicUrlData.publicUrl }
}