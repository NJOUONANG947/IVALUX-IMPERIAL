'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAdminUsers, updateUserRole } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminUsersPage() {
  return (
    <ProtectedAdminRoute>
      <AdminUsersContent />
    </ProtectedAdminRoute>
  );
}

function AdminUsersContent() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = roleFilter !== 'all' ? { role: roleFilter } : { limit: 200 };
      const data = await getAdminUsers(params);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Users Management</h1>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="employee">Employees</option>
            <option value="client">Clients</option>
          </select>
        </div>

        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12 text-luxury-ivory/60">No users found</div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-serif text-luxury-ivory mb-1">{user.full_name || 'No name'}</h3>
                    <p className="text-luxury-ivory/60 text-sm mb-2">{user.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded capitalize ${
                        user.role === 'admin' ? 'bg-luxury-gold/20 text-luxury-gold' :
                        user.role === 'employee' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-charcoal text-luxury-ivory/60'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-luxury-ivory/40">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updating === user.id}
                      className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory disabled:opacity-60"
                    >
                      <option value="client">Client</option>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
