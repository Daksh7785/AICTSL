import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../fetchWithAuth';

export function useComplaints() {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/complaints', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch complaints');
      }
      return res.json();
    },
  });
}

export function useTrackComplaint(trackId) {
  return useQuery({
    queryKey: ['complaint', trackId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/complaints/track/${trackId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Complaint not found');
        }
        throw new Error('Failed to track complaint');
      }
      return res.json();
    },
    enabled: !!trackId,
    retry: false,
  });
}
