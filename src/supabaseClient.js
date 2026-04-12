import { createClient } from '@supabase/supabase-js'

// Vite-ში გარემოს ცვლადებს ვკითხულობთ import.meta.env-ით
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)