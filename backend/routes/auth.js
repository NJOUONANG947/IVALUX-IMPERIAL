/**
 * Auth routes - Supabase Auth integration
 * POST /auth/login - email + password (returns session)
 * POST /auth/logout - invalidate session (client should clear token)
 * GET /auth/me - current user + profile (role)
 */
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Client for auth operations (anon key allows signIn/signOut)
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * POST /auth/signup
 * Body: { email, password, full_name? }
 * Returns: { session, user } or { error } if email confirmation required
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password required' });
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { data: { full_name: full_name || null } },
    });

    if (error) {
      return res.status(400).json({ error: true, message: error.message });
    }

    if (data.session) {
      res.json({
        session: data.session,
        user: data.user,
        access_token: data.session.access_token,
      });
    } else {
      res.status(201).json({
        user: data.user,
        message: 'Check your email to confirm your account',
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { session, user } - frontend stores access_token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password required' });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: true, message: error.message });
    }

    res.json({
      session: data.session,
      user: data.user,
      access_token: data.session.access_token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/logout
 * Body: optional { access_token } or use Authorization header
 * Clears Supabase session server-side
 */
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.access_token;
    if (token) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      await supabase.auth.signOut();
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me
 * Requires: Authorization: Bearer <access_token>
 * Returns: user + profile (role, full_name, country)
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name, country, created_at')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: true, message: 'Failed to load profile' });
    }

    res.json({
      user: req.user,
      profile: profile || null,
      role: profile?.role || 'client',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /auth/me
 * Requires: Authorization: Bearer <access_token>
 * Body: { full_name?, country? }
 * Updates the current user's profile
 */
router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const { full_name, country } = req.body;
    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (country !== undefined) updates.country = country;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: true, message: 'No fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/change-password
 * Requires: Authorization: Bearer <access_token>
 * Body: { new_password }
 * Updates the current user's password
 */
router.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: true, message: 'Password must be at least 6 characters' });
    }

    const { error } = await req.supabase.auth.updateUser({ password: new_password });

    if (error) {
      return res.status(400).json({ error: true, message: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
