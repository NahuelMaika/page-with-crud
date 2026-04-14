'use server'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: {email: string, password: string}) {
  const supabase = await createClient()

  const { error,data} = await supabase.auth.signInWithPassword(formData)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Usuario autenticado correctamente',data}
}

export async function signup(formData: {name: string, email: string, password: string}) {
  const supabase = await createClient()

  const { error,data } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Usuario registrado correctamente',data}
}