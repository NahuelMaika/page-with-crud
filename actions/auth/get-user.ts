import { createClient } from "@/lib/supabase/client";

export const getUser = async () => {
 try{
    const supabase = createClient()
    const { data:{user:session } } = await supabase.auth.getUser();
  
    if(!session) {
      return null;
    }
  
    const userId = session.id;
    const { data: userData, error:userError } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if(userError) {
      console.error('Error fetching user:', userError);
      return null;
    }
    console.log('User fetched successfully:', userData);
    return userData;
    
 }catch(error){
    console.error('Error fetching user:', error);
    return null;
 }
}