/**
 * Role middleware - ensures user has required role
 * Must be used after authMiddleware (req.user must exist)
 * Loads profile.role from profiles table
 */
const { supabaseAdmin } = require('../config/supabase');

function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }

    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({ error: true, message: 'Profile or role not found' });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: true, message: 'Insufficient permissions' });
      }

      req.userRole = profile.role;
      req.profile = profile;
      next();
    } catch (err) {
      return res.status(500).json({ error: true, message: 'Role check failed' });
    }
  };
}

const requireAdmin = () => requireRole('admin');
const requireEmployee = () => requireRole('employee', 'admin');
const requireEmployeeOrAdmin = requireEmployee;

module.exports = { requireRole, requireAdmin, requireEmployee, requireEmployeeOrAdmin };
