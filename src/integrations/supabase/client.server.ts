import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn(
    "[supabase.server] SUPABASE_URL/VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes. Configure o .env."
  );
}

export const supabaseAdmin: SupabaseClient = createClient(
  url ?? "http://localhost",
  serviceRoleKey ?? "service-role-missing",
  { auth: { persistSession: false, autoRefreshToken: false } }
);