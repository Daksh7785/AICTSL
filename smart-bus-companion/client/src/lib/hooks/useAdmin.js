import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../fetchWithAuth';

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // Assuming fetchWithAuth handles the credentials and token refresh
      const res = await fetchWithAuth('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      return res.json();
    },
  });
}

export function useAdminComplaints() {
  return useQuery({
    queryKey: ['adminComplaints'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/admin/complaints', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch admin complaints');
      }
      return res.json();
    },
  });
}
