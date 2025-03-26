import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a singleton instance to avoid multiple instances
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (supabaseInstance) return supabaseInstance

  // These environment variables are already available from the Supabase integration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )

    // Return a mock client for development to prevent crashes
    if (typeof window !== "undefined") {
      return {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({ data: null, error: new Error("Missing Supabase credentials") }),
              order: () => ({ data: [], error: new Error("Missing Supabase credentials") }),
              contains: () => ({ data: [], error: new Error("Missing Supabase credentials") }),
            }),
            order: () => ({ data: [], error: new Error("Missing Supabase credentials") }),
            contains: () => ({ data: [], error: new Error("Missing Supabase credentials") }),
          }),
          insert: () => ({ data: null, error: new Error("Missing Supabase credentials") }),
          update: () => ({ data: null, error: new Error("Missing Supabase credentials") }),
          upsert: () => ({ data: null, error: new Error("Missing Supabase credentials") }),
        }),
        channel: () => ({
          on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        }),
      } as any
    }

    throw new Error("Missing Supabase credentials")
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey)
  return supabaseInstance
}

