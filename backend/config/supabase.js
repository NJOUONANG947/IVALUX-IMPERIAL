/**
 * Supabase client configuration
 * Uses service role for server-side operations (bypasses RLS when needed).
 * For user context, use createClient with user's access token.
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
  console.warn('Supabase credentials missing or placeholder. Set real values in .env to use database.');
}

/**
 * Admin client - bypasses RLS. Use for admin operations and internal logic.
 * FUTURE GROK: Use this client when AI needs to query/update data server-side.
 */
const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey || 'placeholder', {
  auth: { persistSession: false },
});

/**
 * Create a Supabase client with the user's JWT for RLS-aware requests.
 * @param {string} accessToken - User's Supabase access token from session
 */
function createSupabaseClient(accessToken) {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}

module.exports = { supabaseAdmin, createSupabaseClient };
