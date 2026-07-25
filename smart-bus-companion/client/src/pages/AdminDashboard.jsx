import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminStats, useAdminComplaints } from '../lib/hooks/useAdmin';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useAdminStats();
  const { data: compData, isLoading: loadingComplaints, refetch: refetchComplaints } = useAdminComplaints();
  
  const loading = loadingStats || loadingComplaints;
  const complaints = compData?.complaints || [];

  const updateComplaintStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['adminComplaints'] });
      }
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchComplaints();
  };

  if (loading) {
    return <div className="p-4 text-transit-ink">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center border-b pb-4 border-gray-200">
        <h1 className="text-3xl font-bold text-transit-ink">Transit Admin Dashboard</h1>
        <Button onClick={handleRefresh} className="bg-signal-amber text-transit-ink hover:bg-yellow-400">
          Refresh Data
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-transit-ink text-white p-4">
            <h3 className="text-sm font-medium opacity-80">Active Buses</h3>
            <p className="text-3xl font-bold text-signal-amber mt-2">{stats.activeBuses || 0}</p>
          </Card>
          <Card className="bg-white p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Routes</h3>
            <p className="text-3xl font-bold text-transit-ink mt-2">{stats.totalRoutes || 0}</p>
          </Card>
          <Card className="bg-white p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Open Complaints</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.openComplaints || 0}</p>
          </Card>
          <Card className="bg-white p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-transit-ink mt-2">{stats.totalUsers || 0}</p>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-transit-ink mb-4">Recent Complaints</h2>
        <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-transit-ink border-b border-gray-200">
                <th className="p-3 font-semibold">User</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">No complaints found.</td>
                </tr>
              ) : (
                complaints.map(comp => (
                  <tr key={comp._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-800">{comp.user?.name || 'Anonymous'}</td>
                    <td className="p-3 text-sm text-gray-800">{comp.category}</td>
                    <td className="p-3 text-sm text-gray-600 truncate max-w-xs" title={comp.description}>
                      {comp.description}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        comp.status === 'open' ? 'bg-red-100 text-red-800' :
                        comp.status === 'in_review' ? 'bg-signal-amber text-transit-ink' :
                        comp.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm space-x-2">
                      {comp.status !== 'resolved' && (
                        <button 
                          onClick={() => updateComplaintStatus(comp._id, 'resolved')}
                          className="text-green-600 hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                      {comp.status === 'open' && (
                        <button 
                          onClick={() => updateComplaintStatus(comp._id, 'in_review')}
                          className="text-yellow-600 hover:underline"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
