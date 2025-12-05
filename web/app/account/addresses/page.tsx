'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { MapPin, ArrowLeft, Plus, Edit, Trash2, CheckCircle, AlertCircle, Home } from 'lucide-react';

type Address = {
  id: string;
  address_type: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  phone?: string;
  is_default: boolean;
};

export default function AddressesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setCounty('');
    setPostcode('');
    setPhone('');
    setIsDefault(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFullName(address.full_name);
    setAddressLine1(address.address_line1);
    setAddressLine2(address.address_line2 || '');
    setCity(address.city);
    setCounty(address.county || '');
    setPostcode(address.postcode);
    setPhone(address.phone || '');
    setIsDefault(address.is_default);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const addressData = {
        user_id: user.id,
        full_name: fullName,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        county: county || null,
        postcode,
        phone: phone || null,
        is_default: isDefault,
        country: 'United Kingdom',
      };

      if (editingId) {
        const { error } = await supabase
          .from('user_addresses')
          .update(addressData)
          .eq('id', editingId);
        if (error) throw error;
        setSuccess('Address updated successfully!');
      } else {
        const { error } = await supabase
          .from('user_addresses')
          .insert([addressData]);
        if (error) throw error;
        setSuccess('Address added successfully!');
      }

      resetForm();
      loadAddresses();
    } catch (error: any) {
      setError(error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Address deleted successfully!');
      loadAddresses();
    } catch (error: any) {
      setError(error.message || 'Failed to delete address');
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/account" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Address</span>
            </button>
          )}
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">County</label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Set as default address</span>
              </label>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {saving ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Addresses Saved</h2>
            <p className="text-gray-600 mb-6">Add a delivery address to speed up checkout.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow-md p-6 relative">
                {address.is_default && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full border border-green-300">
                      DEFAULT
                    </span>
                  </div>
                )}
                
                <div className="flex items-start mb-4">
                  <Home className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{address.full_name}</h3>
                    <p className="text-sm text-gray-600">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="text-sm text-gray-600">{address.address_line2}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.postcode}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-gray-600 mt-2">{address.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 flex items-center justify-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold py-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 flex items-center justify-center space-x-1 text-red-600 hover:text-red-800 font-semibold py-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
