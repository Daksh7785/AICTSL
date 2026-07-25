import { useQuery } from '@tanstack/react-query';

export function useRoute(routeId) {
  return useQuery({
    queryKey: ['route', routeId],
    queryFn: async () => {
      const res = await fetch(`/api/routes/${routeId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch route');
      }
      return res.json();
    },
    enabled: !!routeId,
  });
}

export function usePredictedETA(routeId, stopId) {
  return useQuery({
    queryKey: ['predictedETA', routeId, stopId],
    queryFn: async () => {
      const res = await fetch(`/api/routes/${routeId}/predicted-eta?stopId=${stopId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch predicted ETA');
      }
      return res.json();
    },
    enabled: !!routeId && !!stopId,
    staleTime: 30000, // Re-fetch ETA more often if needed, but 30s is fine
  });
}
