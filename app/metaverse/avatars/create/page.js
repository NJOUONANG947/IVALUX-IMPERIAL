'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createOrUpdateAvatar } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function CreateAvatarPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    avatar_name: 'My Avatar',
    skin_tone: '',
    hair_style: '',
    hair_color: '',
    eye_color: '',
    avatar_data: {},
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrUpdateAvatar(formData);
      router.push('/metaverse');
    } catch (err) {
      alert(err.message || 'Failed to create avatar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">Create Your Digital Avatar</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-charcoal/50 border border-luxury-gold/20 p-8 rounded-lg">
          <div>
            <label className="block text-sm text-luxury-ivory/80 mb-2">Avatar Name</label>
            <input
              type="text"
              value={formData.avatar_name}
              onChange={(e) => setFormData({ ...formData, avatar_name: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-luxury-ivory/80 mb-2">Skin Tone</label>
              <select
                value={formData.skin_tone}
                onChange={(e) => setFormData({ ...formData, skin_tone: e.target.value })}
                className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
              >
                <option value="">Select</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="tan">Tan</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-luxury-ivory/80 mb-2">Hair Style</label>
              <select
                value={formData.hair_style}
                onChange={(e) => setFormData({ ...formData, hair_style: e.target.value })}
                className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
              >
                <option value="">Select</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
                <option value="curly">Curly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-luxury-ivory/80 mb-2">Hair Color</label>
              <select
                value={formData.hair_color}
                onChange={(e) => setFormData({ ...formData, hair_color: e.target.value })}
                className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
              >
                <option value="">Select</option>
                <option value="black">Black</option>
                <option value="brown">Brown</option>
                <option value="blonde">Blonde</option>
                <option value="red">Red</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-luxury-ivory/80 mb-2">Eye Color</label>
              <select
                value={formData.eye_color}
                onChange={(e) => setFormData({ ...formData, eye_color: e.target.value })}
                className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
              >
                <option value="">Select</option>
                <option value="brown">Brown</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="hazel">Hazel</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              {saving ? 'Creating...' : 'Create Avatar'}
            </motion.button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
