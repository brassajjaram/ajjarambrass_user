const SUPABASE_URL =
  "https://jwhcnseosgkldrlgsxdh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_tNuKEQJa8ae9S_KCo62KJQ_ZmVAvIaw";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );