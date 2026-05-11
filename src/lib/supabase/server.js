import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8000; // 8 s — fail fast instead of hanging for 13 s
const RETRY_DELAY_MS = 2000;   // wait 2 s before the one automatic retry

/**
 * fetch wrapper that aborts after FETCH_TIMEOUT_MS.
 * On abort it waits RETRY_DELAY_MS then tries one more time.
 */
async function fetchWithTimeout(url, options = {}) {
  const attempt = (timeoutMs) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() =>
      clearTimeout(timer)
    );
  };

  try {
    return await attempt(FETCH_TIMEOUT_MS);
  } catch (firstErr) {
    if (firstErr.name !== 'AbortError') throw firstErr;
    // Cold-start: give Supabase a moment then retry once
    await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    return attempt(FETCH_TIMEOUT_MS);
  }
}

// ----------------------------------------------------------------------

/**
 * Create Supabase client with service role key for server-side operations.
 * Uses a timeout+retry fetch so free-tier cold starts don't hang the route.
 * This bypasses RLS policies — use with caution!
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  });
}


