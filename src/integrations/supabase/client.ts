import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !anonKey) {
  // Avisa em dev sem quebrar o build. Configure .env (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY).
  console.warn(
    "[supabase] Variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_PUBLISHABLE_KEY ausentes. Configure o arquivo .env."
  );
}

export const supabase: SupabaseClient = createClient(url ?? "http://localhost", anonKey ?? "public-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});