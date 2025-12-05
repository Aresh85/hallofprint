'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { Settings, ArrowLeft, Mail, MessageSquare, Bell, Tag, CheckCircle, AlertCircle } from 'lucide-react';

type Preferences = {
  marketing_emails: boolean;
  marketing_sms: boolean;
  order_updates: boolean;
  promotional_offers: boolean;
  newsletter: boolean;
};

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [preferences, setPreferences] = useState<Preferences>({
    marketing_emails: true,
    marketing_sms: false,
    order_updates: true,
    promotional_offers: true,
    newsletter: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          marketing_emails: data.marketing_emails,
          marketing_sms: data.marketing_sms,
          order_updates: data.order_updates,
          promotional_offers: data.promotional_offers,
          newsletter: data.newsletter,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;
      setSuccess('Preferences saved successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/account" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication Preferences</h1>
        <p className="text-gray-600 mb-8">
          Choose how you'd like to hear from us. You can change these settings at any time.
        </p>

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-indigo-600" />
            Order Updates
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Essential notifications about your orders
          </p>

          <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={preferences.order_updates}
              onChange={() => handleToggle('order_updates')}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900">Order Status Updates</p>
              <p className="text-sm text-gray-600">
                Receive important updates about your orders, including confirmation, shipping, and delivery notifications.
              </p>
              <span className="inline-block mt-1 text-xs text-indigo-600 font-medium">Recommended</span>
            </div>
          </label>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-indigo-600" />
            Marketing Emails
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Promotional content and special offers
          </p>

          <div className="space-y-3">
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={preferences.marketing_emails}
                onChange={() => handleToggle('marketing_emails')}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">
                  Receive emails about new products, special offers, and exclusive deals.
                </p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={() => handleToggle('newsletter')}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-600">
                  Stay updated with our monthly newsletter featuring printing tips, industry news, and special promotions.
                </p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={preferences.promotional_offers}
                onChange={() => handleToggle('promotional_offers')}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">Promotional Offers</p>
                  <Tag className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Get notified about limited-time offers, seasonal sales, and exclusive discounts.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
            SMS Notifications
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Text message updates (UK mobile numbers only)
          </p>

          <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={preferences.marketing_sms}
              onChange={() => handleToggle('marketing_sms')}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900">Marketing SMS</p>
              <p className="text-sm text-gray-600">
                Receive occasional text messages about flash sales and time-sensitive offers.
              </p>
              <p className="text-xs text-gray-500 mt-1">Standard message rates may apply</p>
            </div>
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Your Privacy Matters:</strong> We respect your choices and will only send you the communications you've opted into. 
            You can change these preferences at any time. We will never sell your information to third parties.
          </p>
          <Link href="/privacy-policy" className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
            Read our Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
