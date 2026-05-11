import { useQuery } from '@tanstack/react-query';
import { fetchTribeCached } from '@/features/worldApiCache/cachedWorldApiQueries';

export function useTribeQuery(tribeId?: string) {
  const query = useQuery({
    queryKey: ['worldApi', 'tribe', tribeId],
    queryFn: async () => {
      const result = await fetchTribeCached(tribeId!);
      if (result.status === 'unavailable') throw new Error(result.reason);
      return result;
    },
    enabled: Boolean(tribeId),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return {
    ...query,
    data: query.data?.data,
    cacheSource: query.data?.source ?? null,
    isStaleCache: query.data?.status === 'stale_fallback',
  };
}
