import { useQuery } from '@tanstack/react-query';

export function useSearchRoutes(from, to) {
  return useQuery({
    queryKey: ['searchRoutes', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/search?from=${from}&to=${to}`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    },
    enabled: !!from && !!to, // Only fetch if both parameters are provided
  });
}
