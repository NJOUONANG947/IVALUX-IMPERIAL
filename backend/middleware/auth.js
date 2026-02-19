/**
 * Auth middleware - validates Supabase session
 * Expects Authorization: Bearer <access_token> from Supabase Auth
 */
const { createSupabaseClient } = require('../config/supabase');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: true, message: 'Missing or invalid authorization header' });
  }

  try {
    const supabase = createSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: true, message: 'Invalid or expired token' });
    }

    req.user = user;
    req.supabase = supabase;
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
