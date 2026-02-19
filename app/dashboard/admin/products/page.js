'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';
import Image from 'next/image';

export default function AdminProductsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminProductsContent />
    </ProtectedAdminRoute>
  );
}

function AdminProductsContent() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    countries_available: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', image_url: '', countries_available: [] });
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      image_url: product.image_url || '',
      countries_available: product.countries_available || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Products Management</h1>
          <motion.button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', description: '', price: '', category: '', image_url: '', countries_available: [] });
              setShowModal(true);
            }}
            className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Product
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <div className="relative aspect-square overflow-hidden mb-4 bg-charcoal/50 border border-luxury-gold/10 rounded">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luxury-ivory/30">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="text-lg font-serif text-luxury-ivory mb-2">{product.name}</h3>
              <p className="text-luxury-gold mb-2">${product.price || '—'}</p>
              <p className="text-luxury-ivory/60 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-4 py-2 border border-red-500/50 text-red-400 text-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-charcoal border border-luxury-gold/30 p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-2xl font-serif text-luxury-ivory mb-6">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-6 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
