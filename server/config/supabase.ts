import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_PROJECT_ID =
  process.env.SUPABASE_PROJECT_ID ||
  process.env.VITE_SUPABASE_PROJECT_ID ||
  "udsvohrfzzeanqnjfazb";

export const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_4Jt6bVElnKJlpU_qqP4dkA_lOihoATw";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
}

export interface SupabaseSyncResult {
  success: boolean;
  supabaseUserId?: string;
  syncMethod: "auth.users" | "table.registrations" | "both" | "failed";
  message: string;
  error?: string;
}

/**
 * Stores student or faculty/professor registration details in Supabase.
 * Details stored:
 * - Email, Password (hashed securely in Supabase Auth)
 * - User Metadata: Full Name, Role ('student' | 'faculty'), Branch, Semester, Roll Number / ID
 * - Also attempts direct table insert into 'registrations' if table exists in Supabase.
 */
export async function storeRegistrationInSupabase(userData: {
  name: string;
  email: string;
  password?: string;
  role: "student" | "faculty";
  branch?: string;
  semester?: number;
  roll_number?: string;
}): Promise<SupabaseSyncResult> {
  const supabase = getSupabase();
  const cleanEmail = userData.email.toLowerCase().trim();
  const fallbackPassword = userData.password || "AiBook#2026!Secured";
  const assignedRole = userData.role === "faculty" ? "faculty" : "student";
  const branch = userData.branch || "Computer Science";
  const semester = parseInt(String(userData.semester), 10) || 1;
  const rollNumber = userData.roll_number?.trim() || "";

  try {
    let supabaseRecordId: string | undefined = undefined;
    let authUserId: string | undefined = undefined;
    let tableInserted = false;

    // 1. Unconditionally insert / upsert into public 'registrations' table in Supabase
    try {
      const { data: existingRows } = await supabase
        .from("registrations")
        .select("id, auth_user_id")
        .eq("email", cleanEmail)
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        supabaseRecordId = existingRows[0].id;
        authUserId = existingRows[0].auth_user_id || undefined;
        tableInserted = true;
        // Update existing record
        await supabase
          .from("registrations")
          .update({
            name: userData.name.trim(),
            role: assignedRole,
            branch,
            semester,
            roll_number: rollNumber,
            updated_at: new Date().toISOString(),
          })
          .eq("email", cleanEmail);
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("registrations")
          .insert([
            {
              name: userData.name.trim(),
              email: cleanEmail,
              role: assignedRole,
              branch,
              semester,
              roll_number: rollNumber,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (!insertError && insertData && insertData.length > 0) {
          tableInserted = true;
          supabaseRecordId = insertData[0].id;
        } else if (insertError) {
          console.warn("[Supabase Table] Note on registrations insert:", insertError.message);
        }
      }
    } catch (tableErr: any) {
      console.warn("[Supabase Table] Exception during registrations table write:", tableErr.message);
    }

    // 2. Also register in Supabase Authentication (auth.users)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: fallbackPassword,
        options: {
          data: {
            name: userData.name.trim(),
            role: assignedRole,
            account_type: assignedRole === "faculty" ? "Faculty / Professor" : "Student",
            branch,
            semester,
            roll_number: rollNumber,
            registered_at: new Date().toISOString(),
            platform: "AI_Book College Notes System",
          },
        },
      });

      if (!authError && authData?.user?.id) {
        authUserId = authData.user.id;
        // Link auth_user_id to registrations table
        await supabase
          .from("registrations")
          .update({ auth_user_id: authUserId })
          .eq("email", cleanEmail);
      } else if (authError) {
        console.warn(`[Supabase Auth] Note for ${cleanEmail}:`, authError.message);
      }
    } catch (authErr: any) {
      console.warn("[Supabase Auth] Note during signUp:", authErr.message);
    }

    // 3. Attempt insert into public.profiles table if auth user ID or profile record can be stored
    try {
      const profileId = authUserId || supabaseRecordId;
      if (profileId) {
        await supabase.from("profiles").upsert(
          {
            id: profileId,
            name: userData.name.trim(),
            email: cleanEmail,
            role: assignedRole,
            branch,
            semester,
            roll_number: rollNumber,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }
    } catch (profileErr: any) {
      // profiles table might have foreign key to auth.users, ignore if auth is unconfirmed
    }

    return {
      success: tableInserted || !!authUserId,
      supabaseUserId: authUserId || supabaseRecordId,
      syncMethod: tableInserted && authUserId ? "both" : tableInserted ? "table.registrations" : "auth.users",
      message: tableInserted
        ? "Registration details successfully saved to Supabase registrations database table."
        : "Registration details saved in Supabase.",
    };
  } catch (err: any) {
    console.error("[Supabase] Unexpected error while storing registration:", err);
    return {
      success: false,
      syncMethod: "failed",
      message: "Supabase registration sync encountered an error.",
      error: err.message,
    };
  }
}

/**
 * Fast ping to verify connection with the Supabase project
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  projectId: string;
  url: string;
  latencyMs: number;
  message: string;
}> {
  const startTime = Date.now();
  const supabase = getSupabase();
  try {
    const { error } = await supabase.auth.getSession();
    const latencyMs = Date.now() - startTime;
    if (error) {
      return {
        connected: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        latencyMs,
        message: error.message,
      };
    }
    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs,
      message: `Successfully connected to Supabase project ${SUPABASE_PROJECT_ID} (${latencyMs}ms)`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs,
      message: err.message || "Failed to reach Supabase server",
    };
  }
}
