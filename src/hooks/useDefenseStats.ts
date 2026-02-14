import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getDefenseStats } from '../api/endpoints';

export function useDefenseStats() {
  return useQuery({
    queryKey: ['defense-stats'],
    queryFn: getDefenseStats,
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}
