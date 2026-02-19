'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { updateProfile, changePassword } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function ProfilePage() {
  return (
    <ProtectedClientRoute>
      <ProfileContent />
    </ProtectedClientRoute>
  );
}

function ProfileContent() {
  const { currentUser, profile } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        country: profile.country || '',
        email: currentUser?.email || '',
      });
    }
  }, [profile, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ full_name: formData.full_name, country: formData.country });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage('Passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    setMessage('');
    try {
      await changePassword(passwordData.new_password);
      setMessage('Password changed successfully!');
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (err) {
      setMessage(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">My Profile</h1>

        <motion.form onSubmit={handleSubmit} className="space-y-6" variants={fadeInUp}>
          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
            />
          </div>

          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 bg-charcoal/50 border border-luxury-gold/20 text-luxury-ivory/60 cursor-not-allowed"
            />
            <p className="text-xs text-luxury-ivory/60 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Country</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
            >
              <option value="">Select Country</option>
              <option value="CA">Canada</option>
              <option value="US">United States</option>
              <option value="FR">France</option>
              <option value="BE">Belgium</option>
            </select>
          </div>

          {message && (
            <motion.div
              className={`p-4 rounded ${
                message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.form>

        {/* Change Password */}
        <div className="mt-12 pt-8 border-t border-luxury-gold/20">
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Change Password</h2>
          <motion.form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-luxury-ivory/80 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
              />
            </div>
            <div>
              <label className="block text-sm text-luxury-ivory/80 mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
              />
            </div>
            <motion.button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-3 border border-luxury-gold text-luxury-gold disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {passwordSaving ? 'Updating...' : 'Change Password'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
}
