import { useQuery } from '@tanstack/react-query';
import {
  fetchFrontierStaticIndex,
  getFrontierSystemIntel,
} from './frontierStaticIndexClient';

export function useFrontierSystemIntelQuery(systemId?: string) {
  const query = useQuery({
    queryKey: ['frontierStaticData', 'systemIntel', systemId],
    queryFn: async () => {
      const index = await fetchFrontierStaticIndex();
      return getFrontierSystemIntel(index, systemId!) ?? null;
    },
    enabled: Boolean(systemId),
    staleTime: Infinity,
    retry: false,
  });

  return {
    ...query,
    data: query.data ?? null,
  };
}
