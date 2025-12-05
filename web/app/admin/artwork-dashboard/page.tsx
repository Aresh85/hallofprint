'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  FileImage, Search, Filter, Calendar, User, Mail, Phone,
  ChevronDown, ChevronUp, ArrowLeft, CheckCircle, XCircle, 
  Clock, Eye, Package, AlertCircle
} from 'lucide-react';

type ArtworkSubmission = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  file_name: string;
  file_size?: number;
  file_url?: string;
  user_id?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  converted_order_id?: string;
  created_at: string;
  updated_at: string;
};

export default function ArtworkDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ArtworkSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [searchTerm, statusFilter, submissions]);

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

      setUserRole(profile.role);
      loadSubmissions();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('artwork_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.customer_name.toLowerCase().includes(term) ||
          sub.customer_email.toLowerCase().includes(term) ||
          sub.file_name.toLowerCase().includes(term)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const updateSubmissionStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('artwork_submissions')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null
        })
        .eq('id', id);

      if (error) throw error;
      
      setReviewModal(null);
      setReviewNotes('');
      loadSubmissions();
      alert(`Submission ${status}!`);
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission');
    }
  };

  const convertToOrder = async (submissionId: string) => {
    if (!confirm('Convert this artwork submission into an order? This will create a new order entry.')) {
      return;
    }

    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      // For now, just mark as converted - you would implement full order creation logic
      const { error } = await supabase
        .from('artwork_submissions')
        .update({
          status: 'converted_to_order',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      loadSubmissions();
      alert('Submission converted! You can now create a full order from this.');
    } catch (error) {
      console.error('Error converting submission:', error);
      alert('Failed to convert submission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'converted_to_order':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileImage className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Artwork Submissions</h1>
                <p className="text-sm text-gray-600">Review and manage customer artwork uploads</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-indigo-600">{submissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/account" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="converted_to_order">Converted to Order</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {submissions.filter((s) => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Reviewing</p>
            <p className="text-2xl font-bold text-blue-600">
              {submissions.filter((s) => s.status === 'reviewing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {submissions.filter((s) => s.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Converted</p>
            <p className="text-2xl font-bold text-purple-600">
              {submissions.filter((s) => s.status === 'converted_to_order').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {submissions.filter((s) => s.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No artwork submissions found</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Submission Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {submission.file_name}
                      </h3>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                        {submission.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {submission.customer_name}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {submission.customer_email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(submission.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateSubmissionStatus(submission.id, 'reviewing')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Start Review
                        </button>
                      </>
                    )}
                    {submission.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => {
                            setReviewModal(submission.id);
                            setReviewNotes('');
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setReviewModal(`reject-${submission.id}`);
                            setReviewNotes('');
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {submission.status === 'approved' && (
                      <button
                        onClick={() => convertToOrder(submission.id)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center"
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Convert to Order
                      </button>
                    )}
                  </div>
                </div>

                {/* FILE DOWNLOAD */}
                {submission.file_url ? (
                  <div className="mt-4 pt-4 border-t bg-green-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-3">📎 ARTWORK FILE</p>
                    <div className="space-y-3">
                      <a 
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline block"
                      >
                        {submission.file_name}
                      </a>
                      <div className="flex gap-2">
                        <a 
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileImage className="w-4 h-4 mr-2" />
                          Download File
                        </a>
                        <a 
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View in Browser
                        </a>
                      </div>
                      <p className="text-xs text-gray-500">
                        📆 Submitted: {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t bg-yellow-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">📎 FILE NOT AVAILABLE</p>
                    <p className="text-xs text-gray-700">
                      This submission was created before direct file storage was implemented. 
                      Contact customer at: <strong>{submission.customer_email}</strong>
                    </p>
                  </div>
                )}

                {/* Submission Details */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">File Size</p>
                    <p className="text-sm text-gray-900">{formatFileSize(submission.file_size)}</p>
                  </div>
                  {submission.customer_phone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1" /> Phone
                      </p>
                      <p className="text-sm text-gray-900">{submission.customer_phone}</p>
                    </div>
                  )}
                </div>

                {submission.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-1">Customer Notes</p>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{submission.notes}</p>
                  </div>
                )}

                {submission.review_notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-1">Review Notes</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">{submission.review_notes}</p>
                    {submission.reviewed_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed: {formatDate(submission.reviewed_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {reviewModal.startsWith('reject-') ? 'Reject Submission' : 'Approve Submission'}
              </h3>
              <button onClick={() => setReviewModal(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Review Notes (optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this submission..."
                  className="w-full p-2 border-2 border-gray-300 rounded-lg h-24 resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const isReject = reviewModal.startsWith('reject-');
                    const id = isReject ? reviewModal.replace('reject-', '') : reviewModal;
                    updateSubmissionStatus(id, isReject ? 'rejected' : 'approved', reviewNotes);
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold text-white ${
                    reviewModal.startsWith('reject-') 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {reviewModal.startsWith('reject-') ? 'Reject' : 'Approve'}
                </button>
                <button
                  onClick={() => setReviewModal(null)}
                  className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
