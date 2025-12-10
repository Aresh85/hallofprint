'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, ArrowLeft, Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';

type SundryTemplate = {
  id: string;
  name: string;
  description: string;
  default_quantity: number;
  default_unit_price: number;
  category: string;
  is_active: boolean;
  created_at: string;
};

export default function SundriesManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<SundryTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_quantity: 1,
    default_unit_price: 0,
    category: 'setup',
    is_active: true,
  });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'operator' && profile.role !== 'admin')) {
        router.push('/account');
        return;
      }

      loadTemplates();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('sundries_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('sundries_templates')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('Template updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('sundries_templates')
          .insert({
            ...formData,
            created_by: user?.id,
          });

        if (error) throw error;
        alert('Template created successfully!');
      }

      setEditingId(null);
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        default_quantity: 1,
        default_unit_price: 0,
        category: 'setup',
        is_active: true,
      });
      loadTemplates();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save template');
    }
  };

  const handleEdit = (template: SundryTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      default_quantity: template.default_quantity,
      default_unit_price: template.default_unit_price,
      category: template.category || 'setup',
      is_active: template.is_active,
    });
    setEditingId(template.id);
    setShowAddForm(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sundries_templates')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('sundries_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Template deleted successfully!');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete template');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'rush': return 'bg-red-100 text-red-800';
      case 'setup': return 'bg-blue-100 text-blue-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'finishing': return 'bg-green-100 text-green-800';
      case 'delivery': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Tag className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sundries Templates</h1>
                <p className="text-sm text-gray-600">Manage reusable pricing items</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  default_quantity: 1,
                  default_unit_price: 0,
                  category: 'setup',
                  is_active: true,
                });
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/orders-enhanced" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Template' : 'Add New Template'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rush Fee"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                >
                  <option value="setup">Setup</option>
                  <option value="rush">Rush</option>
                  <option value="design">Design</option>
                  <option value="finishing">Finishing</option>
                  <option value="delivery">Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description shown to customers"
                  rows={2}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Quantity</label>
                <input
                  type="number"
                  value={formData.default_quantity}
                  onChange={(e) => setFormData({ ...formData, default_quantity: parseInt(e.target.value) })}
                  min="1"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Price (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.default_unit_price}
                  onChange={(e) => setFormData({ ...formData, default_unit_price: parseFloat(e.target.value) })}
                  placeholder="25.00"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </button>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-lg shadow-md p-4 ${!template.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getCategoryColor(template.category)}`}>
                    {template.category.toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              )}

              <div className="flex items-center justify-between text-sm border-t pt-3">
                <div>
                  <p className="text-gray-600">Default: {template.default_quantity} × £{template.default_unit_price.toFixed(2)}</p>
                  <p className="font-bold text-gray-900">= £{(template.default_quantity * template.default_unit_price).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(template.id, template.is_active)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    template.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {template.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Templates Yet</h2>
            <p className="text-gray-600 mb-6">Create your first sundry template to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
