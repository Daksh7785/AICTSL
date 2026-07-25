import { useQuery } from '@tanstack/react-query';

export function useStops() {
  return useQuery({
    queryKey: ['stops'],
    queryFn: async () => {
      const res = await fetch('/api/stops');
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    },
  });
}
