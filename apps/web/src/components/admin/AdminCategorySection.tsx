import React, { useState } from 'react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Folder, X, Layers } from 'lucide-react';

interface AdminCategorySectionProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategorySection: React.FC<AdminCategorySectionProps> = ({ categories, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      if (categoryToEdit) {
        await api.put(`/admin/categories/${categoryToEdit.id}`, { name, description, imageUrl });
      } else {
        await api.post('/admin/categories', { name, description, imageUrl });
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await api.delete(`/admin/categories/${id}`);
        onRefresh();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header action */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Product Category Management</h3>
          <p className="text-xs text-slate-400">Manage categories such as Dry Kibble, Gourmet Wet, Tofu Litter, and Health Care</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 transition hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Image & Category Name</th>
                <th className="py-3.5 px-4">URL Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Total Products</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <code className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">
                    {cat.description || '-'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {cat._count?.products || 0} registered products
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {categoryToEdit ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dry Kibble & Raw"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief category description for customer guidance..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
