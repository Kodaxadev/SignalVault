import { useQuery } from '@tanstack/react-query';
import { fetchGameTypeCached } from '@/features/worldApiCache/cachedWorldApiQueries';

export function useGameTypeQuery(typeId?: string) {
  const query = useQuery({
    queryKey: ['worldApi', 'gameType', typeId],
    queryFn: async () => {
      const result = await fetchGameTypeCached(typeId!);
      if (result.status === 'unavailable') throw new Error(result.reason);
      return result;
    },
    enabled: Boolean(typeId),
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
