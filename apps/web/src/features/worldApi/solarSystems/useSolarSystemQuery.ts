import { useQuery } from '@tanstack/react-query';
import { fetchSolarSystemCached } from '@/features/worldApiCache/cachedWorldApiQueries';

export function useSolarSystemQuery(systemId?: string) {
  const query = useQuery({
    queryKey: ['worldApi', 'solarSystem', systemId],
    queryFn: async () => {
      const result = await fetchSolarSystemCached(systemId!);
      if (result.status === 'unavailable') throw new Error(result.reason);
      return result;
    },
    enabled: Boolean(systemId),
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
