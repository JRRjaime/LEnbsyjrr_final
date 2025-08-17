import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export type Photo = {
  id: string
  filename: string
  original_name: string
  category: string
  storage_path: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  created_at: string
  updated_at: string
}
