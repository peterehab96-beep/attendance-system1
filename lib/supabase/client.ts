import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Check if environment variables are properly configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url_here') {
    console.warn("Supabase environment variables not configured. Using fallback mode.")
    return null
  }
  
  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    console.warn("Invalid Supabase URL format. Using fallback mode.")
    return null
  }
  
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}
