import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_PROJECT_ID =
  (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || "udsvohrfzzeanqnjfazb";

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_4Jt6bVElnKJlpU_qqP4dkA_lOihoATw";

let supabaseClient: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

export async function pingSupabase(): Promise<{
  connected: boolean;
  latency: number;
  projectId: string;
  url: string;
}> {
  const start = performance.now();
  try {
    const client = getClientSupabase();
    await client.auth.getSession();
    const duration = Math.round(performance.now() - start);
    return {
      connected: true,
      latency: duration,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
    };
  } catch {
    return {
      connected: false,
      latency: 0,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
    };
  }
}
